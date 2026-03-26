class Cancellation < ApplicationRecord

 
  belongs_to :ticket_allocation

  
  validates :ticket_allocation_id, presence: true
  validates :refund_amount, presence: true
  validates :status, presence: true
  validates :cancelled_at, presence: true

end