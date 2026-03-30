class Station < ApplicationRecord
  belongs_to :city

  has_many :train_stops, dependent: :restrict_with_exception
  has_many :origin_bookings, class_name: "Booking", foreign_key: :src_station_id, dependent: :restrict_with_exception
  has_many :destination_bookings, class_name: "Booking", foreign_key: :dst_station_id, dependent: :restrict_with_exception

  validates :name, :code, presence: true
  validates :code, uniqueness: true
end
