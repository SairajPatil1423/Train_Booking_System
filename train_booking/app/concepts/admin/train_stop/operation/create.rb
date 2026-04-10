module Admin::TrainStop::Operation
  class Create < Trailblazer::Operation
    step :validate_authorization
    step :validate_presence
    step :validate_train_exists
    step :validate_station_exists
    step :validate_no_duplicate_order
    step :validate_no_duplicate_station
    step :persist
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def validate_presence(ctx, params:, **)
      missing = %i[train_id station_id stop_order distance_from_origin_km].select { |f| params[f].blank? }
      if missing.any?
        ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
        return false
      end
      true
    end

    def validate_train_exists(ctx, params:, **)
      unless ::Train.exists?(id: params[:train_id])
        ctx[:errors] = ["Train with id #{params[:train_id]} not found"]
        return false
      end
      true
    end

    def validate_station_exists(ctx, params:, **)
      unless ::Station.exists?(id: params[:station_id])
        ctx[:errors] = ["Station with id #{params[:station_id]} not found"]
        return false
      end
      true
    end

    def validate_no_duplicate_order(ctx, params:, **)
      if ::TrainStop.exists?(train_id: params[:train_id], stop_order: params[:stop_order])
        ctx[:errors] = ["Stop order #{params[:stop_order]} already exists for this train"]
        return false
      end
      true
    end

    def validate_no_duplicate_station(ctx, params:, **)
      if ::TrainStop.exists?(train_id: params[:train_id], station_id: params[:station_id])
        ctx[:errors] = ["This station is already a stop on this train"]
        return false
      end
      true
    end

    def persist(ctx, params:, **)
      train_stop = ::TrainStop.new(
        train_id: params[:train_id],
        station_id: params[:station_id],
        stop_order: params[:stop_order],
        arrival_at: parse_stop_datetime(params[:arrival_at], params[:arrival_time]),
        departure_at: parse_stop_datetime(params[:departure_at], params[:departure_time]),
        distance_from_origin_km: params[:distance_from_origin_km]
      )
      train_stop.sync_time_columns_from_datetimes
      train_stop.save!
      ctx[:model] = { train_stop: ::Admin::TrainStopSerializer.serialize(train_stop.reload) }
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end

    private

    def parse_stop_datetime(datetime_value, time_value)
      return datetime_value if datetime_value.present?
      return nil if time_value.blank?

      Time.zone.parse("2000-01-01 #{time_value}")
    end
  end
end
