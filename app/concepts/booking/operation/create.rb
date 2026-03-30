module Booking::Operation
  class Create < Trailblazer::Operation
    step :validate_params
    step :find_schedule
    step :find_stops
    step :find_available_seats
    step :calculate_fare
    step :create_booking_in_transaction

    def validate_params(ctx, params:, **)
      params[:user_id].present? && 
      params[:schedule_id].present? && 
      params[:src_station_id].present? && 
      params[:dst_station_id].present? && 
      params[:passengers].is_a?(Array)
    end

    def find_schedule(ctx, params:, **)
      ctx[:schedule] = Schedule.find_by(id: params[:schedule_id])
      ctx[:schedule].present?
    end

    def find_stops(ctx, params:, schedule:, **)
      train_id = schedule.train_id
      src_stop = TrainStop.find_by(train_id: train_id, station_id: params[:src_station_id])
      dst_stop = TrainStop.find_by(train_id: train_id, station_id: params[:dst_station_id])

      return false unless src_stop && dst_stop
      return false unless src_stop.stop_order < dst_stop.stop_order

      ctx[:src_stop] = src_stop
      ctx[:dst_stop] = dst_stop
      true
    end

    def find_available_seats(ctx, params:, schedule:, src_stop:, dst_stop:, **)
      coach_type = params[:coach_type] || 'sleeper'
      passenger_count = params[:passengers].length
      
      seats = Seat.joins(:coach).where(coaches: { train_id: schedule.train_id, coach_type: coach_type })

      available_seats = []
      
      seats.find_each do |seat|
        break if available_seats.length == passenger_count

        overlap = TicketAllocation.where(seat_id: seat.id, schedule_id: schedule.id)
                                  .where.not(status: 'cancelled')
                                  .where("src_stop_order < ? AND dst_stop_order > ?", dst_stop.stop_order, src_stop.stop_order)
                                  .exists?
        
        available_seats << seat unless overlap
      end

      if available_seats.length == passenger_count
        ctx[:allocated_seats] = available_seats
        true
      else
        ctx[:error] = "Not enough seats available"
        false
      end
    end

    def calculate_fare(ctx, params:, schedule:, src_stop:, dst_stop:, **)
      coach_type = params[:coach_type] || 'sleeper'
      rule = FareRule.find_by(train_id: schedule.train_id, coach_type: coach_type)
      
      base = rule ? rule.base_fare_per_km : 1.5
      multiplier = rule ? rule.dynamic_multiplier : 1.0

      distance = dst_stop.distance_from_origin_km - src_stop.distance_from_origin_km
      fare_per_seat = (distance * base * multiplier).round(2)
      
      ctx[:fare_per_seat] = fare_per_seat
      ctx[:total_fare] = (fare_per_seat * params[:passengers].length).round(2)
      true
    end

    def create_booking_in_transaction(ctx, params:, schedule:, src_stop:, dst_stop:, allocated_seats:, total_fare:, fare_per_seat:, **)
      ActiveRecord::Base.transaction do
        booking = Booking.create!(
          user_id: params[:user_id],
          schedule_id: schedule.id,
          src_station_id: src_stop.station_id,
          dst_station_id: dst_stop.station_id,
          booking_ref: "BKG-#{SecureRandom.hex(4).upcase}",
          total_fare: total_fare,
          status: 'confirmed'
        )

        params[:passengers].each_with_index do |p_param, index|
          passenger = Passenger.create!(
            booking_id: booking.id,
            first_name: p_param[:first_name],
            last_name: p_param[:last_name],
            age: p_param[:age],
            gender: p_param[:gender],
            id_type: p_param[:id_type],
            id_number: p_param[:id_number]
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
            pnr: "PNR-#{SecureRandom.hex(4).upcase}",
            fare: fare_per_seat,
            status: 'confirmed'
          )
        end

        Payment.create!(
          booking_id: booking.id,
          amount: total_fare,
          status: 'pending'
        )
        
        ctx[:booking] = booking
      end
      true
    rescue StandardError => e
      ctx[:error] = e.message
      false
    end
  end
end
