# Computes seat availability for a schedule and route segment.
class ScheduleAvailability
  def initialize(schedule:, src_station_id:, dst_station_id:)
    @schedule = schedule
    @src_station_id = src_station_id
    @dst_station_id = dst_station_id
  end

  def call
    return empty_result unless segment.valid?

    total_seats_by_coach_type = Seat.active_for_train(schedule.train_id)
                                    .group("coaches.coach_type")
                                    .count

    available_seats_by_coach_type = Seat.available_for_segment(
      schedule: schedule,
      src_stop_order: segment.src_stop.stop_order,
      dst_stop_order: segment.dst_stop.stop_order
    ).group("coaches.coach_type").count

    coach_summary = total_seats_by_coach_type.each_with_object({}) do |(coach_type, total_seats), result|
      normalized_coach_type = Coach.normalize_coach_type(coach_type)
      next if normalized_coach_type.blank?

      result[normalized_coach_type] = {
        total_active_seats: total_seats,
        available_seats: available_seats_by_coach_type.fetch(coach_type, 0)
      }
    end

    {
      available_seats: coach_summary.values.sum { |entry| entry[:available_seats] },
      coach_type_availability: coach_summary
    }
  end

  private

  attr_reader :schedule, :src_station_id, :dst_station_id

  def segment
    @segment ||= ScheduleSegmentResolver.new(
      schedule: schedule,
      src_station_id: src_station_id,
      dst_station_id: dst_station_id
    ).call
  end

  def empty_result
    {
      available_seats: 0,
      coach_type_availability: {}
    }
  end
end
