module Schedule::Operation
  class Index < Trailblazer::Operation
    step :validate_params
    step :find_matching_train_ids
    step :ensure_daily_schedules
    step :build_scope
    step :paginate!
    step :serialize!

    def validate_params(ctx, params:, **)
      required = %i[src_station_id dst_station_id travel_date]

      return true if required.all? { |key| params[key].present? }

      ctx[:errors] = ['src_station_id, dst_station_id, and travel_date are required.']
      false
    end

    def find_matching_train_ids(ctx, params:, **)
      ctx[:travel_date] = Date.parse(params[:travel_date].to_s)
      ctx[:train_ids] = ::TrainStop
        .from('train_stops src_stops')
        .joins('INNER JOIN train_stops dst_stops ON dst_stops.train_id = src_stops.train_id')
        .where(src_stops: { station_id: params[:src_station_id] })
        .where(dst_stops: { station_id: params[:dst_station_id] })
        .where('src_stops.stop_order < dst_stops.stop_order')
        .distinct
        .pluck('src_stops.train_id')
      true
    rescue Date::Error
      ctx[:errors] = ['travel_date must be a valid date.']
      false
    end

    def ensure_daily_schedules(ctx, travel_date:, train_ids:, **)
      ::Schedule.ensure_daily_schedules!(travel_date: travel_date, train_ids: train_ids)
      true
    rescue StandardError => e
      ctx[:errors] = [e.message]
      false
    end

    def build_scope(ctx, params:, train_ids:, travel_date:, **)
      ctx[:scope] = ::Schedule
        .includes(:train)
        .where(train_id: train_ids)
        .searchable_for_date(travel_date)
        .joins('INNER JOIN train_stops src_stops ON src_stops.train_id = schedules.train_id')
        .joins('INNER JOIN train_stops dst_stops ON dst_stops.train_id = schedules.train_id')
        .where(src_stops: { station_id: params[:src_station_id] })
        .where(dst_stops: { station_id: params[:dst_station_id] })
        .where('src_stops.stop_order < dst_stops.stop_order')
        .order('schedules.departure_time ASC')
        .distinct
    end

    def paginate!(ctx, params:, **)
      page = [(params[:page] || 1).to_i, 1].max
      per_page = [[(params[:per_page] || 10).to_i, 1].max, 50].min

      ctx[:records] = Paginatable::PaginatedCollection.new(
        ctx[:scope],
        current_page: page,
        per_page: per_page
      )
    end

    def serialize!(ctx, records:, params:, **)
      ctx[:model] = {
        data: records.map { |schedule| serialize_schedule_summary(schedule, params) },
        meta: {
          current_page: records.current_page,
          per_page: records.limit_value,
          total_pages: records.total_pages,
          total_count: records.total_count
        }
      }
    end

    private

    def serialize_schedule_summary(schedule, params)
      {
        id: schedule.id,
        travel_date: schedule.travel_date,
        departure_time: schedule.departure_time,
        expected_arrival_time: schedule.expected_arrival_time,
        status: schedule.status,
        train: schedule.train.as_json(only: %i[id train_number name train_type rating grade]),
        availability: ScheduleAvailability.new(
          schedule: schedule,
          src_station_id: params[:src_station_id],
          dst_station_id: params[:dst_station_id]
        ).call
      }
    end
  end
end
