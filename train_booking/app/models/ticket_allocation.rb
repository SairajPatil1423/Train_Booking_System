class TicketAllocation < ApplicationRecord
  STATUSES = %w[booked confirmed cancelled].freeze

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

  with_options presence: true do
    validates :booking
    validates :passenger
    validates :seat
    validates :schedule
    validates :src_station
    validates :dst_station
    validates :src_stop_order
    validates :dst_stop_order
    validates :pnr
    validates :fare
    validates :status
  end

  validates :passenger_id, uniqueness: { scope: :booking_id }
  validates :pnr, uniqueness: true, length: { maximum: 20 }
  validates :fare, numericality: { greater_than_or_equal_to: 0 }
  validates :src_stop_order, numericality: { only_integer: true, greater_than: 0 }
  validates :dst_stop_order, numericality: { greater_than: :src_stop_order }
  validates :status, inclusion: { in: STATUSES }
end
