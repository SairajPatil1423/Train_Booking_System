class Cancellation < ApplicationRecord
  belongs_to :booking
  belongs_to :ticket_allocation, optional: true
  belongs_to :requested_by, class_name: "User"

  enum :status, {
    pending: "pending",
    approved: "approved",
    rejected: "rejected"
  }, default: :pending

  validates :refund_amount, numericality: { greater_than_or_equal_to: 0 }
end
