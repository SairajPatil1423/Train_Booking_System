FactoryBot.define do
  factory :fare_rule do
    association :train
    coach_type { "sleeper" }
    base_fare_per_km { 1.5 }
    dynamic_multiplier { 1.0 }
    valid_from { Date.new(2026, 1, 1) }
    valid_to { Date.new(2026, 12, 31) }
  end
end
