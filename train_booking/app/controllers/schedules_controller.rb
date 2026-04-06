# SchedulesController handles public search and authenticated booking details.
class SchedulesController < ApplicationController
  before_action :authenticate_user!, only: :show

  def index
    if params[:src_station_id].blank? || params[:dst_station_id].blank? || params[:travel_date].blank?
      render json: { error: "src_station_id, dst_station_id, and travel_date are required." }, status: :unprocessable_entity
      return
    end

    travel_date = Date.parse(params[:travel_date].to_s)
    train_ids = TrainStop
      .from("train_stops src_stops")
      .joins("INNER JOIN train_stops dst_stops ON dst_stops.train_id = src_stops.train_id")
      .where(src_stops: { station_id: params[:src_station_id] })
      .where(dst_stops: { station_id: params[:dst_station_id] })
      .where("src_stops.stop_order < dst_stops.stop_order")
      .distinct
      .pluck("src_stops.train_id")

    Schedule.ensure_daily_schedules!(travel_date: travel_date, train_ids: train_ids)

    schedules_scope = Schedule
      .includes(:train)
      .where(train_id: train_ids)
      .searchable_for_date(travel_date)
      .joins("INNER JOIN train_stops src_stops ON src_stops.train_id = schedules.train_id")
      .joins("INNER JOIN train_stops dst_stops ON dst_stops.train_id = schedules.train_id")
      .where(src_stops: { station_id: params[:src_station_id] })
      .where(dst_stops: { station_id: params[:dst_station_id] })
      .where("src_stops.stop_order < dst_stops.stop_order")
      .order("schedules.departure_time ASC")
      .distinct

    schedules = paginate_scope(schedules_scope)

    render json: paginated_response(
      data: schedules.map { |schedule| serialize_schedule_summary(schedule) },
      records: schedules
    ), status: :ok
  rescue Date::Error
    render json: { error: "travel_date must be a valid date." }, status: :unprocessable_entity
  end

  def show
    schedule = Schedule.includes(train: [:coaches, :fare_rules]).find(params[:id])
    segment = selected_stops(schedule)

    unless segment.valid?
      render json: { error: "Invalid journey segment for this schedule." }, status: :unprocessable_entity
      return
    end

    render json: {
      schedule: serialize_schedule_core(schedule),
      stops: serialize_stops(schedule),
      availability: selected_availability(schedule),
      fare_options: fare_options_for_segment(schedule, segment.src_stop, segment.dst_stop),
      coaches: serialize_coaches(schedule),
      seat_map: {
        requested_segment: serialize_requested_segment(segment.src_stop, segment.dst_stop),
        unavailable_seat_ids: unavailable_seat_ids_for_segment(schedule, segment.src_stop, segment.dst_stop),
        allocations: seat_allocations_for_schedule(schedule)
      }
    }, status: :ok
  end

  private

  def selected_availability(schedule)
    ScheduleAvailability.new(
      schedule: schedule,
      src_station_id: params[:src_station_id],
      dst_station_id: params[:dst_station_id]
    ).call
  end

  def selected_stops(schedule)
    ScheduleSegmentResolver.new(
      schedule: schedule,
      src_station_id: params[:src_station_id],
      dst_station_id: params[:dst_station_id]
    ).call
  end

  def unavailable_seat_ids_for_segment(schedule, src_stop, dst_stop)
    TicketAllocation.active_for_schedule(schedule.id)
                    .overlapping_segment(src_stop.stop_order, dst_stop.stop_order)
                    .pluck(:seat_id)
  end

  def fare_options_for_segment(schedule, src_stop, dst_stop)
    distance = dst_stop.distance_from_origin_km - src_stop.distance_from_origin_km

    schedule.train.fare_rules
            .select { |rule| rule.valid_from <= schedule.travel_date && rule.valid_to >= schedule.travel_date }
            .each_with_object({}) do |rule, result|
      result[Coach.normalize_coach_type(rule.coach_type)] = {
        fare_per_seat: (distance * rule.base_fare_per_km * rule.dynamic_multiplier).round(2)
      }
    end
  end

  def serialize_requested_segment(src_stop, dst_stop)
    {
      src_station_id: src_stop.station_id,
      dst_station_id: dst_stop.station_id,
      src_stop_order: src_stop.stop_order,
      dst_stop_order: dst_stop.stop_order
    }
  end

  def seat_allocations_for_schedule(schedule)
    TicketAllocation.active_for_schedule(schedule.id)
                    .includes(:seat)
                    .map do |allocation|
      {
        id: allocation.id,
        seat_id: allocation.seat_id,
        src_stop_order: allocation.src_stop_order,
        dst_stop_order: allocation.dst_stop_order,
        status: allocation.status
      }
    end
  end

  def serialize_schedule_summary(schedule)
    {
      id: schedule.id,
      travel_date: schedule.travel_date,
      departure_time: schedule.departure_time,
      expected_arrival_time: schedule.expected_arrival_time,
      status: schedule.status,
      train: schedule.train.as_json(only: %i[id train_number name train_type rating grade]),
      availability: selected_availability(schedule)
    }
  end

  def serialize_schedule_core(schedule)
    {
      id: schedule.id,
      travel_date: schedule.travel_date,
      departure_time: schedule.departure_time,
      expected_arrival_time: schedule.expected_arrival_time,
      status: schedule.status,
      delay_minutes: schedule.delay_minutes,
      train: schedule.train.as_json(only: %i[id train_number name train_type rating grade])
    }
  end

  def serialize_stops(schedule)
    TrainStop.includes(station: :city)
             .where(train_id: schedule.train_id)
             .order(:stop_order)
             .map do |stop|
      {
        id: stop.id,
        stop_order: stop.stop_order,
        arrival_time: stop.arrival_time,
        departure_time: stop.departure_time,
        distance_from_origin_km: stop.distance_from_origin_km,
        station: stop.station.as_json(
          only: %i[id name code],
          include: { city: { only: %i[id name state country] } }
        )
      }
    end
  end

  def serialize_coaches(schedule)
    schedule.train.coaches.includes(:seats).order(:coach_number).map do |coach|
      {
        id: coach.id,
        train_id: coach.train_id,
        coach_number: coach.coach_number,
        coach_type: coach.api_coach_type,
        total_seats: coach.total_seats,
        seats: coach.seats.order(:seat_number).map do |seat|
          seat.as_json(only: %i[id seat_number seat_type is_active coach_id])
        end
      }
    end
  end
end
