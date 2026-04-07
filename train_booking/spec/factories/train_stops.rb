FactoryBot.define do
  factory :train_stop do
    association :train
    association :station
    sequence(:stop_order) { |n| n }
    distance_from_origin_km { 0 }
    arrival_time { "09:00" }
    departure_time { "09:10" }

    trait :with_datetimes do
      arrival_at { Time.zone.parse("2026-01-01 09:00:00") }
      departure_at { Time.zone.parse("2026-01-01 09:10:00") }
    end
  end
end
