class City < ApplicationRecord
  has_many :stations, dependent: :restrict_with_exception

  validates :name, :country, presence: true
  validates :name, uniqueness: { scope: %i[state country] }
end
