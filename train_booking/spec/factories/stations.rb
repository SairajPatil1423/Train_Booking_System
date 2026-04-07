FactoryBot.define do
  factory :station do
    association :city
    sequence(:name) { |n| "#{Faker::Address.community} Station #{n}" }
    sequence(:code) { |n| "ST#{n.to_s.rjust(2, '0')}" }
    latitude { Faker::Address.latitude }
    longitude { Faker::Address.longitude }
  end
end
