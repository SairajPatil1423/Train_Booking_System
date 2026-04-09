class Passenger < ApplicationRecord
  GENDERS = %w[male female other].freeze

  belongs_to :booking
  has_one :ticket_allocation, dependent: :destroy

  with_options presence: true do
    validates :first_name
    validates :last_name
    validates :age
    validates :gender
    validates :id_type
    validates :id_number
  end

  validates :first_name, length: { maximum: 100 }
  validates :last_name, length: { maximum: 100 }
  validates :age, numericality: { only_integer: true, greater_than: 0, less_than: 120 }
  validates :gender, inclusion: { in: GENDERS }
  validates :id_type, length: { maximum: 50 }
  validates :id_number, length: { maximum: 100 }
end
