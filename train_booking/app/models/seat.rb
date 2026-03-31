class Seat < ApplicationRecord
  belongs_to :coach
  has_many :ticket_allocations, dependent: :restrict_with_exception

  validates :seat_number, :seat_type, presence: true
end
