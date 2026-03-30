class TicketAllocation < ApplicationRecord
  belongs_to :booking
  belongs_to :passenger
  belongs_to :seat
  belongs_to :schedule
  belongs_to :src_station, class_name: "Station"
  belongs_to :dst_station, class_name: "Station"

  has_many :cancellations, dependent: :restrict_with_exception

  enum :status, {
    confirmed: "confirmed",
    cancelled: "cancelled"
  }, default: :confirmed

  validates :pnr, presence: true, uniqueness: true
  validates :fare, numericality: { greater_than_or_equal_to: 0 }
  validates :dst_stop_order, numericality: { greater_than: :src_stop_order }
end
