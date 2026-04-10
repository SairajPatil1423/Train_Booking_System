module Admin::Station::Operation
  class Destroy < Trailblazer::Operation
    step :validate_authorization
    step :find_model
    step :check_dependencies
    step :destroy_model
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def find_model(ctx, id:, **)
      ctx[:model] = ::Station.find_by(id: id)
      if ctx[:model].nil?
        ctx[:errors] = ['Station not found']
        return false
      end
      true
    end

    def check_dependencies(ctx, model:, **)
      if ::TrainStop.exists?(station_id: model.id)
        ctx[:errors] = ['Cannot delete a station that is currently tied to active Train Stops.']
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
