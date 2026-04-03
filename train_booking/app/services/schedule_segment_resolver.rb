class ScheduleSegmentResolver
  RouteSegment = Struct.new(:src_stop, :dst_stop, keyword_init: true) do
    def valid?
      src_stop.present? && dst_stop.present? && src_stop.stop_order < dst_stop.stop_order
    end
  end

  def initialize(schedule:, src_station_id:, dst_station_id:)
    @schedule = schedule
    @src_station_id = src_station_id
    @dst_station_id = dst_station_id
  end

  def call
    stops_by_station_id = TrainStop.where(
      train_id: schedule.train_id,
      station_id: [src_station_id, dst_station_id]
    ).index_by(&:station_id)

    RouteSegment.new(
      src_stop: stops_by_station_id[src_station_id],
      dst_stop: stops_by_station_id[dst_station_id]
    )
  end

  private

  attr_reader :schedule, :src_station_id, :dst_station_id
end
