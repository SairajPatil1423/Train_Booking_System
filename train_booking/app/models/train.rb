class Train < ApplicationRecord
  has_many :train_stops, dependent: :restrict_with_exception
  has_many :stations, through: :train_stops
  has_many :schedules, dependent: :restrict_with_exception
  has_many :coaches, dependent: :restrict_with_exception
  has_many :fare_rules, dependent: :restrict_with_exception

  validates :train_number, :name, :train_type, :rating, presence: true
  validates :train_number, uniqueness: true
  validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
end
