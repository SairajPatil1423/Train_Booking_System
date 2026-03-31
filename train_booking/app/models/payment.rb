class Payment < ApplicationRecord
  belongs_to :booking

  enum :status, {
    pending: "pending",
    paid: "paid",
    partially_refunded: "partially_refunded",
    refunded: "refunded",
    failed: "failed"
  }, default: :pending

  validates :amount, numericality: { greater_than_or_equal_to: 0 }
end
