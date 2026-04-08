module Admin::Schedule::Operation
  class Destroy < Trailblazer::Operation
    step :authorize!
    step :find_model
    step :destroy_model
    step :serialize_result

    def authorize!(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def find_model(ctx, params:, **)
      ctx[:model] = ::Schedule.find_by(id: params[:id])
      unless ctx[:model]
        ctx[:errors] = ["Schedule not found"]
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
      ctx[:model] = { message: 'Schedule deleted' }
    end
  end
end
