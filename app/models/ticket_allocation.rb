class TicketAllocation < ApplicationRecord
  belongs_to :booking
  belongs_to :passenger
  belongs_to :seat
  belongs_to :schedule
  belongs_to :src_station
  belongs_to :dst_station
end
