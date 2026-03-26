class Schedule < ApplicationRecord


  belongs_to :train
  has_many :bookings, dependent: :destroy
  has_many :coaches, dependent: :destroy
  
  
  validates :train_id, presence: true
  validates :journey_date, presence: true
  validates :total_distance_km, presence: true

  validates :journey_date, uniqueness: { scope: :train_id }

end