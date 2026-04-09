class Booking < ApplicationRecord
  STATUSES = %w[pending booked confirmed partially_cancelled cancelled].freeze

  belongs_to :user
  belongs_to :schedule
  belongs_to :src_station, class_name: "Station"
  belongs_to :dst_station, class_name: "Station"

  has_many :passengers, dependent: :destroy
  has_many :ticket_allocations, dependent: :destroy
  has_one :payment, dependent: :destroy
  has_many :cancellations, dependent: :restrict_with_exception

  enum :status, {
    pending: "pending",
    booked: "booked",
    confirmed: "confirmed",
    partially_cancelled: "partially_cancelled",
    cancelled: "cancelled"
  }, default: :pending

  with_options presence: true do
    validates :user
    validates :schedule
    validates :src_station
    validates :dst_station
    validates :booking_ref
    validates :status
  end

  validates :booking_ref, uniqueness: true, length: { maximum: 20 }
  validates :status, inclusion: { in: STATUSES }
  validates :total_fare, numericality: { greater_than_or_equal_to: 0 }

  validate :source_and_destination_must_differ

  private

  def source_and_destination_must_differ
    return if src_station_id.blank? || dst_station_id.blank?
    return unless src_station_id == dst_station_id

    errors.add(:dst_station_id, "must be different from source station")
  end
end
