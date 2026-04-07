FactoryBot.define do
  factory :passenger do
    association :booking
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    age { 28 }
    gender { %w[male female].sample }
    id_type { %w[Aadhaar Passport PAN].sample }
    sequence(:id_number) { |n| "ID#{Faker::Number.number(digits: 6)}#{n}" }
  end
end
