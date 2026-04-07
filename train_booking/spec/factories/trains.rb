FactoryBot.define do
  factory :train do
    sequence(:train_number) { |n| "12#{n.to_s.rjust(3, '0')}" }
    sequence(:name) { |n| "#{Faker::Lorem.unique.word.capitalize} Express #{n}" }
    train_type { "Express" }
    rating { 4.2 }
    grade { "A" }
    is_active { true }
  end
end
