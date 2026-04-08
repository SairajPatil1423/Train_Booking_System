module Booking::Operation
  class Show < Trailblazer::Operation
    step :find_booking, Output(:failure) => Track(:failure)
    step :serialize!
    fail :normalize_failure

    def find_booking(ctx, current_user:, params:, **)
      ctx[:booking] = Booking.where(user_id: current_user.id)
                             .includes(
                               :payment,
                               :passengers,
                               :src_station,
                               :dst_station,
                               :cancellations,
                               { ticket_allocations: :seat },
                               { schedule: :train }
                             )
                             .find_by(id: params[:id])

      if ctx[:booking].nil?
        ctx[:error] = "Booking not found"
        return false
      end
      true
    end

    def serialize!(ctx, booking:, **)
      ctx[:model] = {
        booking: booking.as_json(include: {
          schedule: {
            include: { train: { only: %i[id train_number name train_type] } }
          },
          src_station: { only: %i[id name code] },
          dst_station: { only: %i[id name code] },
          passengers: {},
          ticket_allocations: {
            include: { seat: { only: %i[id seat_number seat_type coach_id] } }
          },
          payment: {},
          cancellations: {}
        })
      }
    end

    def normalize_failure(ctx, **)
      ctx[:errors] = Array(ctx[:errors] || ctx[:error] || "Operation failed")
    end
  end
end
