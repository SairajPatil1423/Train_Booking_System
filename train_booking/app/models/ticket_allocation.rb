class TicketAllocation < ApplicationRecord
  belongs_to :booking
  belongs_to :passenger
  belongs_to :seat
  belongs_to :schedule
  belongs_to :src_station, class_name: "Station"
  belongs_to :dst_station, class_name: "Station"

  has_many :cancellations, dependent: :restrict_with_exception

  enum :status, {
    booked: "booked",
    confirmed: "confirmed",
    cancelled: "cancelled"
  }, default: :confirmed

  scope :active_for_schedule, ->(schedule_id) { where(schedule_id: schedule_id).where.not(status: :cancelled) }
  scope :overlapping_segment, lambda { |new_src_stop_order, new_dst_stop_order|
    where("? < dst_stop_order AND ? > src_stop_order", new_src_stop_order, new_dst_stop_order)
  }

  validates :pnr, presence: true, uniqueness: true
  validates :fare, numericality: { greater_than_or_equal_to: 0 }
  validates :dst_stop_order, numericality: { greater_than: :src_stop_order }
end
