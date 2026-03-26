class Train < ApplicationRecord

 
  has_many :train_stops, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :coaches, dependent: :destroy
  has_many :schedules, dependent: :destroy

  validates :train_number, presence: true, uniqueness: true
  validates :name, presence: true
  validates :train_type, presence: true
  validates :is_active, inclusion: { in: [true, false] }

end