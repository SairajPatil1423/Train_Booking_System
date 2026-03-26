class City < ApplicationRecord

  
  has_many :stations, dependent: :destroy

  
  validates :name, presence: true
  validates :state, presence: true
  validates :country, presence: true

  validates :name, uniqueness: {
    scope: [:state, :country],
    message: "already exists in this state and country"
  }

end