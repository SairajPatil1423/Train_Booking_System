module Booking::Operation
  class Show < Trailblazer::Operation
    step :find_booking
    step :serialize!
    fail :collect_errors

    def find_booking(ctx, current_user:, params:, **)
      ctx[:booking] = Booking.where(user_id: current_user.id)
                             .includes(
                               :payment, :passengers, :src_station, :dst_station,
                               :cancellations, { ticket_allocations: :seat }, { schedule: :train }
                             ).find_by(id: params[:id])

      if ctx[:booking].nil?
        ctx[:errors] = ["Booking not found"]
        return false
      end
      true
    end

    def serialize!(ctx, booking:, **)
      ctx[:model] = {
        booking: BookingSerializer.serialize(booking)
      }
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
