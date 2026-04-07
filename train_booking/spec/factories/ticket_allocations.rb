FactoryBot.define do
  factory :ticket_allocation do
    association :booking
    association :passenger
    association :seat
    association :schedule
    association :src_station, factory: :station
    association :dst_station, factory: :station
    src_stop_order { 1 }
    dst_stop_order { 2 }
    sequence(:pnr) { |n| "PNR-#{n.to_s.rjust(6, '0')}" }
    fare { 250.0 }
    status { :booked }
  end
end
