module Admin::Train::Operation
  class Destroy < Trailblazer::Operation
    step :authorize!
    step :find_model, Output(:failure) => Track(:failure)
    step :destroy_model, Output(:failure) => Track(:failure)
    step :serialize_result
    fail :normalize_failure

    def authorize!(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def find_model(ctx, params:, **)
      ctx[:model] = ::Train.find_by(id: params[:id])
      unless ctx[:model]
        ctx[:errors] = ["Train not found"]
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

    def serialize_result(ctx, **)
      ctx[:model] = { message: 'Train deleted successfully' }
    end

    def normalize_failure(ctx, **)
      ctx[:errors] = Array(ctx[:errors] || ctx[:error] || "Operation failed")
    end
  end
end
