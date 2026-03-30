class Coach < ApplicationRecord
  belongs_to :train
  has_many :seats, dependent: :destroy

  validates :coach_number, :coach_type, presence: true
  validates :total_seats, numericality: { greater_than: 0 }
end
