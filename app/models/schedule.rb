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
end
