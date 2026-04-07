FactoryBot.define do
  factory :seat do
    association :coach
    sequence(:seat_number) { |n| n.to_s }
    seat_type { "LB" }
    is_active { true }
  end
end
