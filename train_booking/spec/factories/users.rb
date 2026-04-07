FactoryBot.define do
  factory :user do
    sequence(:email) { |n| Faker::Internet.unique.email(name: "user#{n}") }
    password { "password123" }
    password_confirmation { "password123" }
    sequence(:username) { |n| "#{Faker::Internet.unique.username(specifier: 6..12)}_#{n}" }
    full_name { Faker::Name.name }
    address { Faker::Address.full_address }
    phone { Faker::Number.number(digits: 10) }
    role { :user }

    trait :admin do
      role { :admin }
      sequence(:email) { |n| Faker::Internet.unique.email(name: "admin#{n}") }
      sequence(:username) { |n| "admin_#{Faker::Internet.unique.username(specifier: 6..12)}_#{n}" }
      full_name { Faker::Name.name_with_middle }
    end
  end
end
