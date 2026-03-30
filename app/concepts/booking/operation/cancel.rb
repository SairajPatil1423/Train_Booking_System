module Booking::Operation
  class Cancel < Trailblazer::Operation
    step :find_booking
    step :check_policy
    step :cancel_in_transaction

    def find_booking(ctx, params:, **)
      ctx[:booking] = Booking.find_by(id: params[:booking_id])
      ctx[:booking].present?
    end

    def check_policy(ctx, booking:, current_user:, **)
      current_user.admin? || booking.user_id == current_user.id
    end

    def cancel_in_transaction(ctx, booking:, current_user:, params:, **)
      ActiveRecord::Base.transaction do
        booking.update!(status: 'cancelled')
        booking.ticket_allocations.update_all(status: 'cancelled')
        
        reason = params[:reason] || "User requested cancellation"
        refund_amount = (booking.total_fare * 0.8).round(2) # 80% refund logic

        Cancellation.create!(
          booking_id: booking.id,
          requested_by: current_user.id,
          reason: reason,
          refund_amount: refund_amount,
          status: 'approved' 
        )
      end
      true
    rescue StandardError => e
      ctx[:error] = e.message
      false
    end
  end
end
