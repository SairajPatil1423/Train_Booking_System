class Passenger < ApplicationRecord


  belongs_to :booking
  has_one :ticket_allocation, dependent: :destroy

  
  validates :booking_id, presence: true
  validates :name, presence: true
  validates :age, presence: true
  validates :gender, presence: true

end