FactoryBot.define do
  factory :booking do
    association :user
    association :schedule
    association :src_station, factory: :station
    association :dst_station, factory: :station
    sequence(:booking_ref) { |n| "BKG-#{n.to_s.rjust(6, '0')}" }
    total_fare { 250.0 }
    status { :booked }
  end
end
