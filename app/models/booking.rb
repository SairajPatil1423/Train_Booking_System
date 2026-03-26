class Booking < ApplicationRecord

  
  belongs_to :user
  belongs_to :schedule

  has_many :passengers, dependent: :destroy
  has_many :ticket_allocations, dependent: :destroy
  has_one :payment, dependent: :destroy
  has_one :cancellation, dependent: :destroy
  
  validates :user_id, presence: true
  validates :schedule_id, presence: true
  validates :status, presence: true
  validates :total_amount, presence: true

end