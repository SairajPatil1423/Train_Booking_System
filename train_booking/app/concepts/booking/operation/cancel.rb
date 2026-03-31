module Booking::Operation
  class Cancel < Trailblazer::Operation
    step :find_booking
    step :cancel_in_transaction

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

    def cancel_in_transaction(ctx, booking:, current_user:, params:, **)
      refund_result = Refund::Operation::Calculate.call(
        amount: booking.ticket_allocations.where.not(status: :cancelled).sum(:fare),
        schedule: booking.schedule
      )

      unless refund_result.success?
        ctx[:error] = refund_result[:error]
        return false
      end

      ActiveRecord::Base.transaction do
        refundable_allocations = booking.ticket_allocations.where.not(status: :cancelled)

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

        booking.update!(status: :cancelled)
        booking.payment&.update!(status: :refunded)

        ctx[:booking] = booking.reload
        ctx[:refund_amount] = refund_result[:refund_amount]
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      ctx[:error] = e.message
      false
    end
  end
end
