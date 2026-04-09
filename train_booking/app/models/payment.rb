class Payment < ApplicationRecord
  STATUSES = %w[pending paid partially_refunded refunded failed].freeze

  belongs_to :booking

  enum :status, {
    pending: "pending",
    paid: "paid",
    partially_refunded: "partially_refunded",
    refunded: "refunded",
    failed: "failed"
  }, default: :pending

  with_options presence: true do
    validates :booking
    validates :amount
    validates :currency
    validates :payment_method
    validates :status
  end

  validates :amount, numericality: { greater_than: 0 }
  validates :currency, length: { maximum: 10 }
  validates :payment_method, length: { maximum: 50 }
  validates :gateway_txn_id, length: { maximum: 100 }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }
end
