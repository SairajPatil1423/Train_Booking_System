module Admin::Station::Operation
  class Create < Trailblazer::Operation
    step :validate_authorization
    step :ensure_city_exists
    step :validate_presence
    step :validate_uniqueness
    step :persist
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def ensure_city_exists(ctx, params:, **)
      if params[:city_id].blank? && params[:city_name].present?
        city = ::City.find_or_create_by(
          name: params[:city_name]
        ) do |c|
          c.state = params[:city_state] || params[:city_name]
          c.country = params[:city_country] || 'Unknown'
        end
        ctx[:city_id] = city.id
      else
        ctx[:city_id] = params[:city_id]
      end

      if ctx[:city_id].blank?
        ctx[:errors] = ['city_id or city_name must be provided']
        return false
      end
      true
    end

    def validate_presence(ctx, params:, **)
      if params[:name].blank? || params[:code].blank?
        ctx[:errors] = ['name and code cannot be blank']
        return false
      end
      true
    end

    def validate_uniqueness(ctx, params:, **)
      if ::Station.exists?(code: params[:code])
        ctx[:errors] = ["Station code #{params[:code]} already exists"]
        return false
      end
      true
    end

    def persist(ctx, params:, city_id:, **)
      ctx[:model] = ::Station.create!(
        city_id: city_id,
        name: params[:name],
        code: params[:code],
        latitude: params[:latitude],
        longitude: params[:longitude]
      )
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
