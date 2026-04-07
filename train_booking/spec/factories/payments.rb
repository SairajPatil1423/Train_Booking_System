FactoryBot.define do
  factory :payment do
    association :booking
    amount { 250.0 }
    currency { "INR" }
    payment_method { "upi" }
    sequence(:gateway_txn_id) { |n| "TXN#{Faker::Alphanumeric.alphanumeric(number: 8).upcase}#{n}" }
    status { :paid }
    paid_at { nil }
  end
end
