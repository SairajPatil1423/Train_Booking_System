class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :schedule
  belongs_to :src_station
  belongs_to :dst_station
end
