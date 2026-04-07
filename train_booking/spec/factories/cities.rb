FactoryBot.define do
  factory :city do
    sequence(:name) { |n| "#{Faker::Address.city} #{n}" }
    state { Faker::Address.state }
    country { Faker::Address.country }
  end
end
