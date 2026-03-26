class Payment < ApplicationRecord


  belongs_to :booking

  
  validates :booking_id, presence: true
  validates :amount, presence: true
  validates :status, presence: true
  validates :payment_method, presence: true

end