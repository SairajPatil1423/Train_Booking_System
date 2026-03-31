class SchedulesController < ApplicationController
  before_action :authenticate_user!

  def index
    authorize Schedule

    src_station_id = params[:src_station_id]
    dst_station_id = params[:dst_station_id]

    unless src_station_id.present? && dst_station_id.present?
      return render json: { error: 'src_station_id and dst_station_id are required' }, status: :bad_request
    end

    travel_date = params[:travel_date].present? ? Date.parse(params[:travel_date]) : Date.today

    valid_train_ids = TrainStop
      .from("train_stops src_stops")
      .joins("INNER JOIN train_stops dst_stops ON dst_stops.train_id = src_stops.train_id")
      .where("src_stops.station_id = ?", src_station_id)
      .where("dst_stops.station_id = ?", dst_station_id)
      .where("dst_stops.stop_order > src_stops.stop_order")
      .distinct
      .pluck("src_stops.train_id")

    if valid_train_ids.empty?
      return render json: { schedules: [], message: 'No trains found for this route' }, status: :ok
    end

    schedules = Schedule
      .includes(:train)
      .where(train_id: valid_train_ids, travel_date: travel_date)
      .where.not(status: 'cancelled')
      .order(:departure_time)

    schedules_with_availability = schedules.map do |schedule|
      schedule.as_json(include: { train: { only: %i[id train_number name train_type] } }).merge(
        availability: ScheduleAvailability.new(
          schedule: schedule,
          src_station_id: src_station_id,
          dst_station_id: dst_station_id
        ).call
      )
    end

    render json: {
      travel_date: travel_date,
      src_station_id: src_station_id,
      dst_station_id: dst_station_id,
      schedules: schedules_with_availability
    }, status: :ok

  rescue Date::Error
    render json: { error: 'Invalid date format. Use YYYY-MM-DD' }, status: :bad_request
  end

  def show
    schedule = Schedule.includes(train: [train_stops: :station, coaches: :seats]).find(params[:id])
    authorize schedule

    train_stops = schedule.train.train_stops.order(:stop_order)
    src_stop, dst_stop = selected_stops(schedule)
    availability = selected_availability(schedule)
    unavailable_seat_ids = unavailable_seat_ids_for_segment(schedule, src_stop, dst_stop)
    fare_options = fare_options_for_segment(schedule, src_stop, dst_stop)

    render json: {
      schedule: schedule.as_json(include: { train: { only: %i[id train_number name train_type] } }),
      stops: train_stops.as_json(include: { station: { only: %i[id name code] } }),
      coaches: schedule.train.coaches.order(:coach_number).map do |coach|
        coach.as_json(only: %i[id coach_number coach_type total_seats]).merge(
          seats: coach.seats.order(:seat_number).as_json(only: %i[id seat_number seat_type is_active])
        )
      end,
      availability: availability,
      fare_options: fare_options,
      seat_map: {
        unavailable_seat_ids: unavailable_seat_ids
      }
    }, status: :ok
  end

  private

  def selected_availability(schedule)
    return nil unless params[:src_station_id].present? && params[:dst_station_id].present?

    ScheduleAvailability.new(
      schedule: schedule,
      src_station_id: params[:src_station_id],
      dst_station_id: params[:dst_station_id]
    ).call
  end

  def selected_stops(schedule)
    return [nil, nil] unless params[:src_station_id].present? && params[:dst_station_id].present?

    src_stop = TrainStop.find_by(train_id: schedule.train_id, station_id: params[:src_station_id])
    dst_stop = TrainStop.find_by(train_id: schedule.train_id, station_id: params[:dst_station_id])

    [src_stop, dst_stop]
  end

  def unavailable_seat_ids_for_segment(schedule, src_stop, dst_stop)
    return [] unless src_stop && dst_stop

    TicketAllocation.where(schedule_id: schedule.id)
                    .where.not(status: :cancelled)
                    .where("src_stop_order < ? AND dst_stop_order > ?", dst_stop.stop_order, src_stop.stop_order)
                    .pluck(:seat_id)
  end

  def fare_options_for_segment(schedule, src_stop, dst_stop)
    return {} unless src_stop && dst_stop

    distance = dst_stop.distance_from_origin_km - src_stop.distance_from_origin_km
    return {} if distance <= 0

    FareRule.where(train_id: schedule.train_id)
            .where("valid_from <= ? AND valid_to >= ?", schedule.travel_date, schedule.travel_date)
            .order(valid_from: :desc)
            .each_with_object({}) do |rule, result|
              next if result.key?(rule.coach_type)

              result[rule.coach_type] = {
                fare_per_seat: (distance * rule.base_fare_per_km * rule.dynamic_multiplier).round(2),
                distance_km: distance
              }
            end
  end
end
