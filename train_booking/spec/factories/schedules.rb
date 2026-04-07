FactoryBot.define do
  factory :schedule do
    association :train
    travel_date { Date.new(2026, 6, 1) }
    departure_time { "07:00" }
    expected_arrival_time { "12:00" }
    status { :scheduled }
    delay_minutes { 0 }
  end
end
