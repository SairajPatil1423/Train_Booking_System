class Seat < ApplicationRecord

  
  belongs_to :coach

  

  validates :coach_id, presence: true
  validates :seat_number, presence: true
  validates :seat_type, presence: true

  validates :seat_number, uniqueness: { scope: :coach_id }

end