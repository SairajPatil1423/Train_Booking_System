class Passenger < ApplicationRecord
  belongs_to :booking
  has_one :ticket_allocation, dependent: :destroy

  validates :first_name, :last_name, :gender, presence: true
  validates :age, numericality: { greater_than: 0 }
end
