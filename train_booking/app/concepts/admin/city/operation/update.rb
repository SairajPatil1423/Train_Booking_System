module Admin::City::Operation
  class Update < Trailblazer::Operation
    step :validate_authorization
    step :find_model
    step :validate_uniqueness
    step :update_model
    step :serialize_result
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user&.admin?
    end

    def find_model(ctx, id:, **)
      ctx[:model] = ::City.find_by(id: id)
      return true if ctx[:model]

      ctx[:errors] = ["City not found"]
      false
    end

    def validate_uniqueness(ctx, params:, model:, **)
      name = params[:name] || model.name
      state = params.key?(:state) ? params[:state] : model.state
      country = params[:country] || model.country

      return true unless ::City.where(name: name, state: state, country: country).where.not(id: model.id).exists?

      ctx[:errors] = ["City already exists with the same name, state, and country"]
      false
    end

    def update_model(ctx, params:, model:, **)
      update_attrs = params.slice(:name, :state, :country)
      model.update!(update_attrs)
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def serialize_result(ctx, model:, **)
      ctx[:model] = { message: "City updated successfully", city: model }
      true
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
