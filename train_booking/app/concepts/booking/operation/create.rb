module Booking::Operation
  class Create < Trailblazer::Operation
    class BookingError < StandardError; end

    step :validate_params
    step :find_schedule
    step :find_stops
    step :calculate_fare
    step :create_booking_in_transaction

    def validate_params(ctx, params:, **)
      required_fields = %i[user_id schedule_id src_station_id dst_station_id coach_type]
      missing_fields = required_fields.select { |field| params[field].blank? }

      if missing_fields.any?
        ctx[:error] = "Missing required fields: #{missing_fields.join(', ')}"
        return false
      end

      unless params[:passengers].is_a?(Array) && params[:passengers].any?
        ctx[:error] = "At least one passenger is required"
        return false
      end

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
      src_stop = TrainStop.find_by(train_id: schedule.train_id, station_id: params[:src_station_id])
      dst_stop = TrainStop.find_by(train_id: schedule.train_id, station_id: params[:dst_station_id])

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

    def calculate_fare(ctx, params:, schedule:, src_stop:, dst_stop:, **)
      rule = FareRule.where(train_id: schedule.train_id, coach_type: params[:coach_type])
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

    def create_booking_in_transaction(ctx, params:, schedule:, src_stop:, dst_stop:, total_fare:, fare_per_seat:, **)
      ActiveRecord::Base.transaction do
        allocated_seats = allocate_seats!(
          schedule: schedule,
          coach_type: params[:coach_type],
          src_stop: src_stop,
          dst_stop: dst_stop,
          passenger_count: params[:passengers].length
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

    def allocate_seats!(schedule:, coach_type:, src_stop:, dst_stop:, passenger_count:)
      available_seats = []

      Seat.joins(:coach)
          .where(seats: { is_active: true }, coaches: { train_id: schedule.train_id, coach_type: coach_type })
          .order("coaches.coach_number ASC", "seats.seat_number ASC")
          .lock("FOR UPDATE SKIP LOCKED")
          .each do |seat|
        overlap = TicketAllocation.lock
                                  .where(seat_id: seat.id, schedule_id: schedule.id)
                                  .where.not(status: :cancelled)
                                  .where("src_stop_order < ? AND dst_stop_order > ?", dst_stop.stop_order, src_stop.stop_order)
                                  .exists?

        next if overlap

        available_seats << seat
        break if available_seats.length == passenger_count
      end

      return available_seats if available_seats.length == passenger_count

      raise BookingError, "Not enough seats available for the selected segment"
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
