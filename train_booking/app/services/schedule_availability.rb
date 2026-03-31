class ScheduleAvailability
  def initialize(schedule:, src_station_id:, dst_station_id:)
    @schedule = schedule
    @src_station_id = src_station_id
    @dst_station_id = dst_station_id
  end

  def call
    return empty_result unless src_stop && dst_stop

    coach_summary = active_seats
      .joins(:coach)
      .group("coaches.coach_type")
      .count
      .each_with_object({}) do |(coach_type, total_seats), result|
        available_seats = seats_for_coach_type(coach_type).count { |seat| available_for_segment?(seat.id) }
        result[coach_type] = {
          total_active_seats: total_seats,
          available_seats: available_seats
        }
      end

    {
      available_seats: coach_summary.values.sum { |entry| entry[:available_seats] },
      coach_type_availability: coach_summary
    }
  end

  private

  attr_reader :schedule, :src_station_id, :dst_station_id

  def src_stop
    @src_stop ||= TrainStop.find_by(train_id: schedule.train_id, station_id: src_station_id)
  end

  def dst_stop
    @dst_stop ||= TrainStop.find_by(train_id: schedule.train_id, station_id: dst_station_id)
  end

  def active_seats
    @active_seats ||= Seat.joins(:coach)
                          .where(seats: { is_active: true }, coaches: { train_id: schedule.train_id })
  end

  def seats_for_coach_type(coach_type)
    active_seats.where(coaches: { coach_type: coach_type }).includes(:coach)
  end

  def available_for_segment?(seat_id)
    !TicketAllocation.where(seat_id: seat_id, schedule_id: schedule.id)
                     .where.not(status: :cancelled)
                     .where("src_stop_order < ? AND dst_stop_order > ?", dst_stop.stop_order, src_stop.stop_order)
                     .exists?
  end

  def empty_result
    {
      available_seats: 0,
      coach_type_availability: {}
    }
  end
end
