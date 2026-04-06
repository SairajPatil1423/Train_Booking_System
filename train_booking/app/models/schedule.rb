class Schedule < ApplicationRecord
  belongs_to :train

  has_many :bookings, dependent: :restrict_with_exception
  has_many :ticket_allocations, dependent: :restrict_with_exception

  enum :status, {
    scheduled: "scheduled",
    departed: "departed",
    completed: "completed",
    cancelled: "cancelled"
  }, default: :scheduled

  validates :travel_date, :departure_time, :expected_arrival_time, presence: true

  scope :active_for_date, ->(date) { where(travel_date: date).where.not(status: "cancelled") }
  scope :searchable_for_date, lambda { |date|
    relation = active_for_date(date)

    if date == Time.zone.today
      relation = relation.where("schedules.departure_time > ?", Time.zone.now.strftime("%H:%M:%S"))
    end

    relation
  }

  def self.ensure_daily_schedules!(travel_date:, train_ids:)
    return if travel_date.blank? || train_ids.blank?

    Train.includes(:train_stops)
         .where(id: train_ids, is_active: true)
         .find_each do |train|
      next if exists?(train_id: train.id, travel_date: travel_date)

      ordered_stops = train.train_stops.sort_by(&:stop_order)
      origin_stop = ordered_stops.find { |stop| stop.departure_time.present? }
      destination_stop = ordered_stops.reverse.find { |stop| stop.arrival_time.present? }

      next unless origin_stop&.departure_time && destination_stop&.arrival_time

      create!(
        train: train,
        travel_date: travel_date,
        departure_time: origin_stop.departure_time,
        expected_arrival_time: destination_stop.arrival_time,
        status: :scheduled,
        delay_minutes: 0
      )
    end
  end
end
