module Booking::Operation
  class CancelTicket < Trailblazer::Operation
    step :find_booking, Output(:failure) => Track(:failure)
    step :validate_authorization, Output(:failure) => Track(:failure)
    step :find_ticket_allocation, Output(:failure) => Track(:failure)
    step :validate_ticket_status, Output(:failure) => Track(:failure)
    step :cancel_ticket_in_transaction, Output(:failure) => Track(:failure)
    step :serialize_result, Output(:failure) => Track(:failure)
    fail :normalize_failure

    def find_booking(ctx, params:, **)
      ctx[:booking] = Booking.find_by(id: params[:booking_id])

      if ctx[:booking].blank?
        ctx[:error] = "Booking not found"
        return false
      end

      true
    end

    def validate_authorization(ctx, booking:, current_user:, **)
      unless current_user.present? && (booking.user_id == current_user.id || (current_user.respond_to?(:admin?) && current_user.admin?))
        ctx[:error] = "Not authorized to cancel this ticket"
        return false
      end
      true
    end

    def find_ticket_allocation(ctx, booking:, params:, **)
      ctx[:ticket_allocation] = booking.ticket_allocations.find_by(id: params[:ticket_allocation_id])

      if ctx[:ticket_allocation].blank?
        ctx[:error] = "Ticket allocation not found"
        return false
      end

      true
    end

    def validate_ticket_status(ctx, ticket_allocation:, **)
      if ticket_allocation.cancelled?
        ctx[:error] = "Ticket is already cancelled"
        return false
      end

      true
    end

    def cancel_ticket_in_transaction(ctx, booking:, ticket_allocation:, current_user:, params:, **)
      refund_result = Refund::Operation::Calculate.call(amount: ticket_allocation.fare, schedule: booking.schedule)
      unless refund_result.success?
        ctx[:error] = refund_result[:error]
        return false
      end

      ActiveRecord::Base.transaction do
        ticket_allocation.update!(status: :cancelled)

        Cancellation.create!(
          booking_id: booking.id,
          ticket_allocation_id: ticket_allocation.id,
          requested_by_id: current_user.id,
          reason: params[:reason].presence || "User requested ticket cancellation",
          refund_amount: refund_result[:refund_amount],
          status: :approved
        )

        update_booking_state!(booking)
        update_payment_state!(booking)

        ctx[:booking] = booking.reload
        ctx[:refund_amount] = refund_result[:refund_amount]
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      ctx[:error] = e.message
      false
    end

    private

    def update_booking_state!(booking)
      remaining_active_count = booking.ticket_allocations.where.not(status: :cancelled).count

      if remaining_active_count.zero?
        booking.update!(status: :cancelled)
      else
        updated_total_fare = booking.ticket_allocations.where.not(status: :cancelled).sum(:fare)
        booking.update!(status: :partially_cancelled, total_fare: updated_total_fare)
      end
    end

    def update_payment_state!(booking)
      return unless booking.payment

      if booking.cancelled?
        booking.payment.update!(status: :refunded)
      else
        booking.payment.update!(status: :partially_refunded)
      end
    end

    def serialize_result(ctx, booking:, refund_amount:, **)
      ctx[:model] = {
        message: "Ticket cancelled successfully.",
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
