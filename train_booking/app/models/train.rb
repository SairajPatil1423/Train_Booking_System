class Train < ApplicationRecord
  has_many :train_stops, dependent: :restrict_with_exception
  has_many :stations, through: :train_stops
  has_many :schedules, dependent: :restrict_with_exception
  has_many :coaches, dependent: :restrict_with_exception
  has_many :fare_rules, dependent: :restrict_with_exception

  with_options presence: true do
    validates :train_number
    validates :name
    validates :train_type
    validates :rating
  end

  validates :train_number, uniqueness: true, length: { maximum: 20 }
  validates :name, length: { maximum: 100 }
  validates :train_type, length: { maximum: 50 }
  validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
end
