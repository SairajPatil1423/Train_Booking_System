class BookingSerializer
  SEED_ROUTE_BASE_DATE = Date.new(2000, 1, 1)

  def self.serialize(booking)
    new(booking).serialize
  end

  def initialize(booking)
    @booking = booking
  end

  def serialize
    booking.as_json(include: {
      user: { only: %i[id email phone role] },
      schedule: {
        include: { train: { only: %i[id train_number name train_type] } }
      },
      src_station: { only: %i[id name code] },
      dst_station: { only: %i[id name code] },
      passengers: {},
      ticket_allocations: {
        include: { seat: { only: %i[id seat_number seat_type coach_id] } }
      },
      payment: {},
      cancellations: {}
    }).merge(
      "segment_timing" => segment_timing
    )
  end

  private

  attr_reader :booking

  def segment_timing
    segment = ScheduleSegmentResolver.new(
      schedule: booking.schedule,
      src_station_id: booking.src_station_id,
      dst_station_id: booking.dst_station_id
    ).call

    return {} unless segment.valid?

    {
      departure_time: segment.src_stop.departure_time || segment.src_stop.arrival_time,
      departure_day_offset: day_offset_for(segment.src_stop.departure_at || segment.src_stop.arrival_at),
      arrival_time: segment.dst_stop.arrival_time || segment.dst_stop.departure_time,
      arrival_day_offset: day_offset_for(segment.dst_stop.arrival_at || segment.dst_stop.departure_at),
      src_stop_order: segment.src_stop.stop_order,
      dst_stop_order: segment.dst_stop.stop_order
    }
  end

  def day_offset_for(datetime_value)
    return 0 if datetime_value.blank?

    (datetime_value.to_date - SEED_ROUTE_BASE_DATE).to_i
  end
end
