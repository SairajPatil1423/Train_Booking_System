class Coach < ApplicationRecord


  belongs_to :schedule
  has_many :seats, dependent: :destroy
  

  validates :schedule_id, presence: true
  validates :coach_number, presence: true
  validates :coach_type, presence: true
  validates :total_seats, presence: true

  validates :coach_number, uniqueness: { scope: :schedule_id }

end