class Seat < ApplicationRecord
  SEAT_TYPES = %w[LB UB MB SL SU W A].freeze

  belongs_to :coach
  has_many :ticket_allocations, dependent: :restrict_with_exception

  validates :seat_number, :seat_type, presence: true
  validates :seat_type, inclusion: { in: SEAT_TYPES }
end
