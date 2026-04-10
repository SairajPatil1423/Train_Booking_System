module Booking::Operation
  class Cancel < Trailblazer::Operation
    step :find_booking
    step :validate_authorization
    step :cancel_in_transaction
    step :serialize_result
    fail :collect_errors

    def find_booking(ctx, params:, **)
      ctx[:booking] = Booking.find_by(id: params[:booking_id])

      if ctx[:booking].blank?
        ctx[:errors] = ["Booking not found"]
        return false
      end

      if ctx[:booking].cancelled?
        ctx[:errors] = ["Booking is already cancelled"]
        return false
      end

      true
    end

    def validate_authorization(ctx, booking:, current_user:, **)
      unless current_user.present? && (booking.user_id == current_user.id || (current_user.respond_to?(:admin?) && current_user.admin?))
        ctx[:errors] = ["Not authorized to cancel this booking"]
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
        ctx[:errors] = refund_result[:errors]
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
      ctx[:errors] = [e.message]
      false
    end

    def serialize_result(ctx, booking:, refund_amount:, **)
      ctx[:model] = {
        message: "Booking cancelled successfully.",
        booking: BookingSerializer.serialize(booking),
        refund_amount: refund_amount
      }
      true
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
