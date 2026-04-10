module Admin::Coach::Operation
  class Destroy < Trailblazer::Operation
    step :validate_authorization
    step :find_model
    step :check_seat_history
    step :destroy_model
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def find_model(ctx, id:, **)
      ctx[:model] = ::Coach.find_by(id: id)
      if ctx[:model].nil?
        ctx[:errors] = ['Coach not found']
        return false
      end
      true
    end

    def check_seat_history(ctx, model:, **)
      seat_ids = model.seats.pluck(:id)

      if ::TicketAllocation.where(seat_id: seat_ids).exists?
        ctx[:errors] = ['Cannot delete coach: ticket allocations exist for its seats']
        return false
      end

      true
    end

    def destroy_model(ctx, model:, **)
      model.destroy!
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
