class Station < ApplicationRecord
  belongs_to :city

  has_many :train_stops, dependent: :restrict_with_exception
  has_many :origin_bookings, class_name: "Booking", foreign_key: :src_station_id, dependent: :restrict_with_exception
  has_many :destination_bookings, class_name: "Booking", foreign_key: :dst_station_id, dependent: :restrict_with_exception

  with_options presence: true do
    validates :city
    validates :name
    validates :code
  end

  validates :name, length: { maximum: 100 }
  validates :code, uniqueness: true, length: { maximum: 20 }
end
