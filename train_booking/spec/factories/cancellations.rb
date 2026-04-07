FactoryBot.define do
  factory :cancellation do
    association :booking
    association :ticket_allocation
    association :requested_by, factory: :user
    reason { Faker::Lorem.sentence(word_count: 4) }
    refund_amount { 100.0 }
    status { :approved }
  end
end
