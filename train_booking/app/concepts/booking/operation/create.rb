module Booking::Operation
  class Create < Trailblazer::Operation
    require 'pry'
    class BookingError < StandardError; end

    step :validate_params

    step :find_schedule
    step :find_stops
    step :find_requested_seats
    step :calculate_fare
    step :create_booking_in_transaction

    def validate_params(ctx, params:, **)
      
      binding.pry
      required_fields = %i[user_id schedule_id src_station_id dst_station_id]
      missing_fields = required_fields.select { |field| params[field].blank? }
        # return false
      if missing_fields.any?
        ctx[:error] = "Missing required fields: #{missing_fields.join(', ')}"
        return false
      end

      unless params[:passengers].is_a?(Array) && params[:passengers].any?
        ctx[:error] = "At least one passenger is required"
        return false
      end

      requested_seat_ids = Array(params[:seat_ids].presence || params[:seat_id]).flatten.compact_blank

      if requested_seat_ids.blank?
        ctx[:error] = "At least one seat must be selected"
        return false
      end

      if requested_seat_ids.uniq.length != requested_seat_ids.length
        ctx[:error] = "Duplicate seat selections are not allowed"
        return false
      end

      if requested_seat_ids.length != params[:passengers].length
        ctx[:error] = "Selected seats must match the passenger count"
        return false
      end

      ctx[:requested_seat_ids] = requested_seat_ids
      true
    end

    def find_schedule(ctx, params:, **)
      ctx[:schedule] = Schedule.find_by(id: params[:schedule_id])

      if ctx[:schedule].blank?
        ctx[:error] = "Schedule not found"
        return false
      end

      if ctx[:schedule].cancelled?
        ctx[:error] = "Schedule is cancelled"
        return false
      end

      true
    end

    def find_stops(ctx, params:, schedule:, **)
      segment = ScheduleSegmentResolver.new(
        schedule: schedule,
        src_station_id: params[:src_station_id],
        dst_station_id: params[:dst_station_id]
      ).call

      src_stop = segment.src_stop
      dst_stop = segment.dst_stop

      unless src_stop && dst_stop
        ctx[:error] = "Both source and destination stations must belong to the train route"
        return false
      end

      unless src_stop.stop_order < dst_stop.stop_order
        ctx[:error] = "Destination must come after source on the route"
        return false
      end

      ctx[:src_stop] = src_stop
      ctx[:dst_stop] = dst_stop
      true
    end

    def find_requested_seats(ctx, schedule:, requested_seat_ids:, params:, **)
      seats_by_id = Seat.active_for_train(schedule.train_id)
                        .includes(:coach)
                        .where(id: requested_seat_ids)
                        .index_by(&:id)

      ordered_seats = requested_seat_ids.filter_map { |seat_id| seats_by_id[seat_id] }

      if ordered_seats.length != requested_seat_ids.length
        ctx[:error] = "One or more selected seats are invalid for this train or inactive"
        return false
      end

      coach_types = ordered_seats.map { |seat| seat.coach.api_coach_type }.uniq
      if coach_types.length != 1
        ctx[:error] = "All selected seats must belong to the same coach class"
        return false
      end

      if params[:coach_type].present? && Coach.normalize_coach_type(params[:coach_type]) != coach_types.first
        ctx[:error] = "Selected seats do not match the requested coach class"
        return false
      end

      ctx[:selected_seats] = ordered_seats
      ctx[:coach_type] = coach_types.first
      true
    end

    def calculate_fare(ctx, params:, schedule:, src_stop:, dst_stop:, coach_type:, **)
      rule = FareRule.where(train_id: schedule.train_id, coach_type: coach_type)
                     .where("valid_from <= ? AND valid_to >= ?", schedule.travel_date, schedule.travel_date)
                     .order(valid_from: :desc)
                     .first

      unless rule
        ctx[:error] = "No fare rule configured for the selected train, coach type, and travel date"
        return false
      end

      distance = dst_stop.distance_from_origin_km - src_stop.distance_from_origin_km
      fare_per_seat = (distance * rule.base_fare_per_km * rule.dynamic_multiplier).round(2)

      ctx[:fare_per_seat] = fare_per_seat
      ctx[:total_fare] = (fare_per_seat * params[:passengers].length).round(2)
      true
    end

    def create_booking_in_transaction(ctx, params:, schedule:, src_stop:, dst_stop:, total_fare:, fare_per_seat:, selected_seats:, **)
      ActiveRecord::Base.transaction do
        allocated_seats = validate_and_lock_selected_seats!(
          schedule: schedule,
          selected_seats: selected_seats,
          src_stop: src_stop,
          dst_stop: dst_stop
        )

        booking = Booking.create!(
          user_id: params[:user_id],
          schedule_id: schedule.id,
          src_station_id: src_stop.station_id,
          dst_station_id: dst_stop.station_id,
          booking_ref: generate_unique_booking_ref,
          total_fare: total_fare,
          status: :booked
        )

        params[:passengers].each_with_index do |passenger_params, index|
          passenger = Passenger.create!(
            booking_id: booking.id,
            first_name: passenger_params[:first_name],
            last_name: passenger_params[:last_name],
            age: passenger_params[:age],
            gender: passenger_params[:gender],
            id_type: passenger_params[:id_type],
            id_number: passenger_params[:id_number]
          )

          TicketAllocation.create!(
            booking_id: booking.id,
            passenger_id: passenger.id,
            seat_id: allocated_seats[index].id,
            schedule_id: schedule.id,
            src_station_id: src_stop.station_id,
            dst_station_id: dst_stop.station_id,
            src_stop_order: src_stop.stop_order,
            dst_stop_order: dst_stop.stop_order,
            pnr: generate_unique_pnr,
            fare: fare_per_seat,
            status: :booked
          )
        end

        Payment.create!(
          booking_id: booking.id,
          amount: total_fare,
          payment_method: params.dig(:payment, :payment_method),
          gateway_txn_id: params.dig(:payment, :gateway_txn_id),
          status: :paid
        )

        ctx[:booking] = booking.reload
      end

      true
    rescue BookingError, ActiveRecord::RecordInvalid => e
      ctx[:error] = e.message
      false
    end

    private

    def validate_and_lock_selected_seats!(schedule:, selected_seats:, src_stop:, dst_stop:)
      locked_seats_by_id = Seat.where(id: selected_seats.map(&:id), is_active: true)
                               .lock("FOR UPDATE")
                               .index_by(&:id)
      locked_seats = selected_seats.filter_map { |seat| locked_seats_by_id[seat.id] }

      if locked_seats.length != selected_seats.length
        raise BookingError, "One or more selected seats are no longer available"
      end

      conflicting_seat_ids = TicketAllocation.active_for_schedule(schedule.id)
                                             .where(seat_id: locked_seats.map(&:id))
                                             .overlapping_segment(src_stop.stop_order, dst_stop.stop_order)
                                             .lock
                                             .pluck(:seat_id)

      return locked_seats if conflicting_seat_ids.empty?

      conflicting_labels = selected_seats.select { |seat| conflicting_seat_ids.include?(seat.id) }.map(&:seat_number)
      raise BookingError, "Selected seat(s) already booked for this segment: #{conflicting_labels.join(', ')}"
    end

    def generate_unique_booking_ref
      loop do
        booking_ref = "BKG-#{SecureRandom.alphanumeric(10).upcase}"
        return booking_ref unless Booking.exists?(booking_ref: booking_ref)
      end
    end

    def generate_unique_pnr
      loop do
        pnr = "PNR-#{SecureRandom.alphanumeric(10).upcase}"
        return pnr unless TicketAllocation.exists?(pnr: pnr)
      end
    end
  end
end
