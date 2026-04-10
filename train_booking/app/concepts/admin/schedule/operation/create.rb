module Admin::Schedule::Operation
  class Create < Trailblazer::Operation
    step :validate_authorization
    step :validate_presence
    step :validate_train_exists
    step :validate_no_duplicate_schedule
    step :validate_times
    step :persist
    step :serialize_result
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def validate_presence(ctx, params:, **)
      missing = %i[train_id travel_date departure_time expected_arrival_time].select { |f| params[f].blank? }
      if missing.any?
        ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
        return false
      end
      true
    end

    def validate_train_exists(ctx, params:, **)
      ctx[:train] = ::Train.find_by(id: params[:train_id])
      unless ctx[:train]
        ctx[:errors] = ["Train #{params[:train_id]} not found"]
        return false
      end
      unless ctx[:train].is_active?
        ctx[:errors] = ['Cannot schedule an inactive train']
        return false
      end
      true
    end

    def validate_no_duplicate_schedule(ctx, params:, **)
      if ::Schedule.exists?(train_id: params[:train_id], travel_date: params[:travel_date])
        ctx[:errors] = ["A schedule already exists for this train on #{params[:travel_date]}"]
        return false
      end
      true
    end

    def validate_times(ctx, params:, **)
      dep = Time.parse(params[:departure_time].to_s) rescue nil
      arr = Time.parse(params[:expected_arrival_time].to_s) rescue nil
      unless dep && arr
        ctx[:errors] = ['Invalid time format. Use HH:MM']
        return false
      end
      true
    end

    def persist(ctx, params:, **)
      ctx[:model] = ::Schedule.create!(
        train_id: params[:train_id],
        travel_date: params[:travel_date],
        departure_time: params[:departure_time],
        expected_arrival_time: params[:expected_arrival_time],
        status: params.fetch(:status, 'scheduled'),
        delay_minutes: params.fetch(:delay_minutes, 0)
      )
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def serialize_result(ctx, model:, **)
      ctx[:model] = { message: 'Schedule created', schedule: model }
      true
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
