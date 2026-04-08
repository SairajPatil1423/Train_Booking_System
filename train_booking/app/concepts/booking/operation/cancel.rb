module Booking::Operation
  class Cancel < Trailblazer::Operation
    step :find_booking, Output(:failure) => Track(:failure)
    step :validate_authorization, Output(:failure) => Track(:failure)
    step :cancel_in_transaction, Output(:failure) => Track(:failure)
    step :serialize_result, Output(:failure) => Track(:failure)
    fail :normalize_failure

    def find_booking(ctx, params:, **)
      ctx[:booking] = Booking.find_by(id: params[:booking_id])

      if ctx[:booking].blank?
        ctx[:error] = "Booking not found"
        return false
      end

      if ctx[:booking].cancelled?
        ctx[:error] = "Booking is already cancelled"
        return false
      end

      true
    end

    def validate_authorization(ctx, booking:, current_user:, **)
      unless current_user.present? && (booking.user_id == current_user.id || (current_user.respond_to?(:admin?) && current_user.admin?))
        ctx[:error] = "Not authorized to cancel this booking"
        return false
      end
      true
    end

    def cancel_in_transaction(ctx, booking:, current_user:, params:, **)
      refundable_allocations = booking.ticket_allocations.where.not(status: :cancelled)

      refund_result = Refund::Operation::Calculate.call(
        amount: refundable_allocations.sum(:fare),
        schedule: booking.schedule
      )

      unless refund_result.success?
        ctx[:error] = refund_result[:error]
        return false
      end

      ActiveRecord::Base.transaction do
        refundable_allocations.find_each do |allocation|
          allocation.update!(status: :cancelled)

          Cancellation.create!(
            booking_id: booking.id,
            ticket_allocation_id: allocation.id,
            requested_by_id: current_user.id,
            reason: params[:reason].presence || "User requested cancellation",
            refund_amount: (allocation.fare.to_d * refund_result[:refund_ratio]).round(2),
            status: :approved
          )
        end

        booking.update!(status: :cancelled, total_fare: 0)
        booking.payment&.update!(status: :refunded)

        ctx[:booking] = booking.reload
        ctx[:refund_amount] = refund_result[:refund_amount]
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      ctx[:error] = e.message
      false
    end

    def serialize_result(ctx, booking:, refund_amount:, **)
      ctx[:model] = {
        message: "Booking cancelled successfully.",
        booking: booking.as_json(include: {
          user: { only: %i[id email phone role] },
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
        }),
        refund_amount: refund_amount
      }
      true
    end

    def normalize_failure(ctx, **)
      ctx[:errors] = Array(ctx[:errors] || ctx[:error] || "Operation failed")
    end
  end
end
