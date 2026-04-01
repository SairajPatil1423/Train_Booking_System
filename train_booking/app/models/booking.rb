class Booking < ApplicationRecord
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

  validates :booking_ref, presence: true, uniqueness: true
  validates :total_fare, numericality: { greater_than_or_equal_to: 0 }
end
