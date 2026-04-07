FactoryBot.define do
  factory :coach do
    association :train
    sequence(:coach_number) { |n| "S#{n}" }
    coach_type { "sleeper" }
    total_seats { Coach::COACH_LAYOUTS.fetch("sleeper")[:total_seats] }

    trait :one_ac do
      coach_type { "1ac" }
      total_seats { Coach::COACH_LAYOUTS.fetch("1ac")[:total_seats] }
    end

    trait :two_ac do
      coach_type { "2ac" }
      total_seats { Coach::COACH_LAYOUTS.fetch("2ac")[:total_seats] }
    end
  end
end
