class City < ApplicationRecord
  has_many :stations, dependent: :restrict_with_exception

  with_options presence: true do
    validates :name
    validates :state
    validates :country
  end

  validates :name, length: { maximum: 100 }
  validates :state, length: { maximum: 100 }
  validates :country, length: { maximum: 100 }
  validates :name, uniqueness: { scope: %i[state country] }
end
