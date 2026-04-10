module Admin::Booking::Operation
  class Show < Trailblazer::Operation
    step :authorize!
    step :find_booking
    step :serialize!
    fail :collect_errors

    def authorize!(ctx, current_user:, **)
      return false unless current_user&.admin?
      true
    end

    def find_booking(ctx, params:, **)
      ctx[:booking] = Booking.includes(
                               :user, :passengers, :payment, :src_station, :dst_station,
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
        booking: booking.as_json(include: {
          user: { only: %i[id email phone role] },
          schedule: { include: { train: { only: %i[id train_number name train_type] } } },
          src_station: { only: %i[id name code] },
          dst_station: { only: %i[id name code] },
          passengers: {},
          ticket_allocations: { include: { seat: { only: %i[id seat_number seat_type coach_id] } } },
          payment: {},
          cancellations: {}
        })
      }
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
