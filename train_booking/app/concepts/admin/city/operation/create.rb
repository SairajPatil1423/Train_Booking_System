module Admin::City::Operation
  class Create < Trailblazer::Operation
    step :validate_authorization
    step :validate_presence
    step :validate_uniqueness
    step :persist
    step :serialize_result
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user&.admin?
    end

    def validate_presence(ctx, params:, **)
      missing = %i[name country].select { |field| params[field].blank? }
      if missing.any?
        ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
        return false
      end
      true
    end

    def validate_uniqueness(ctx, params:, **)
      return true unless ::City.exists?(name: params[:name], state: params[:state], country: params[:country])

      ctx[:errors] = ["City already exists with the same name, state, and country"]
      false
    end

    def persist(ctx, params:, **)
      ctx[:model] = ::City.create!(
        name: params[:name],
        state: params[:state],
        country: params[:country]
      )
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def serialize_result(ctx, model:, **)
      ctx[:model] = { message: "City created successfully", city: model }
      true
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
