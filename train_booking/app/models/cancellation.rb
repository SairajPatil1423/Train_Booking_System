class Cancellation < ApplicationRecord
  STATUSES = %w[pending approved rejected].freeze

  belongs_to :booking
  belongs_to :ticket_allocation, optional: true
  belongs_to :requested_by, class_name: "User"

  enum :status, {
    pending: "pending",
    approved: "approved",
    rejected: "rejected"
  }, default: :pending

  with_options presence: true do
    validates :booking
    validates :requested_by
    validates :reason
    validates :status
  end

  validates :status, inclusion: { in: STATUSES }
  validates :refund_amount, numericality: { greater_than_or_equal_to: 0 }
end
