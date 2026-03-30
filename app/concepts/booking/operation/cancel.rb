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

      true
    end

    def cancel_in_transaction(ctx, booking:, current_user:, params:, **)
      ActiveRecord::Base.transaction do
        booking.update!(status: :cancelled)
        booking.ticket_allocations.update_all(status: TicketAllocation.statuses[:cancelled])
        booking.payment&.update!(status: :refunded)

        Cancellation.create!(
          booking_id: booking.id,
          requested_by_id: current_user.id,
          reason: params[:reason].presence || "User requested cancellation",
          refund_amount: (booking.total_fare * 0.8).round(2),
          status: :approved
        )
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      ctx[:error] = e.message
      false
    end
  end
end
