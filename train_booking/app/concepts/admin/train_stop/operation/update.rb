module Admin::TrainStop::Operation
  class Update < Trailblazer::Operation
    step :validate_authorization
    step :find_model
    step :validate_no_duplicate_order
    step :update_model
    fail :collect_errors

    def validate_authorization(ctx, current_user:, **)
      current_user && current_user.admin?
    end

    def find_model(ctx, id:, **)
      ctx[:model] = ::TrainStop.find_by(id: id)
      if ctx[:model].nil?
        ctx[:errors] = ['TrainStop not found']
        return false
      end
      true
    end

    def validate_no_duplicate_order(ctx, params:, model:, **)
      return true unless params[:stop_order].present?

      duplicate = ::TrainStop
        .where(train_id: model.train_id, stop_order: params[:stop_order])
        .where.not(id: model.id)

      if duplicate.exists?
        ctx[:errors] = ["Stop order #{params[:stop_order]} already exists for this train"]
        return false
      end
      true
    end

    def update_model(ctx, params:, model:, **)
      update_attrs = {}
      update_attrs[:stop_order] = params[:stop_order] if params.key?(:stop_order)
      update_attrs[:arrival_at] = parse_stop_datetime(params[:arrival_at], params[:arrival_time]) if params.key?(:arrival_at) || params.key?(:arrival_time)
      update_attrs[:departure_at] = parse_stop_datetime(params[:departure_at], params[:departure_time]) if params.key?(:departure_at) || params.key?(:departure_time)
      update_attrs[:distance_from_origin_km] = params[:distance_from_origin_km] if params.key?(:distance_from_origin_km)

      model.update!(update_attrs)
      model.sync_time_columns_from_datetimes
      model.save! if model.changed?
      ctx[:model] = { train_stop: ::Admin::TrainStopSerializer.serialize(model.reload) }
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
