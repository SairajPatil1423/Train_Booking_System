module Admin::TrainStop::Operation
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
      ctx[:model] = ::TrainStop.find_by(id: id)
      if ctx[:model].nil?
        ctx[:errors] = ['TrainStop not found']
        return false
      end
      true
    end

    def check_dependencies(ctx, model:, **)
      active_allocs = ::TicketAllocation
        .where(schedule_id: ::Schedule.where(train_id: model.train_id).select(:id))
        .where(
          'src_station_id = ? OR dst_station_id = ?',
          model.station_id, model.station_id
        ).where(status: 'confirmed')

      if active_allocs.exists?
        ctx[:errors] = ['Cannot remove this stop: active ticket allocations exist for this station on this train']
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
