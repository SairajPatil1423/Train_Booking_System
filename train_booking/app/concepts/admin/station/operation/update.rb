module Admin::Station::Operation
  class Update < Trailblazer::Operation
    step :validate_authorization
    step :find_model
    step :update_model
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

    def update_model(ctx, params:, model:, **)
      update_attrs = {}
      update_attrs[:name] = params[:name] if params.key?(:name)
      update_attrs[:code] = params[:code] if params.key?(:code)
      update_attrs[:latitude] = params[:latitude] if params.key?(:latitude)
      update_attrs[:longitude] = params[:longitude] if params.key?(:longitude)
      update_attrs[:city_id] = params[:city_id] if params[:city_id].present?

      model.update!(update_attrs)
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
