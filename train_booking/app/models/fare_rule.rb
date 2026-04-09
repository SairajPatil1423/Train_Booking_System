class FareRule < ApplicationRecord
  belongs_to :train

  with_options presence: true do
    validates :train
    validates :coach_type
    validates :valid_from
    validates :valid_to
    validates :base_fare_per_km
    validates :dynamic_multiplier
  end

  validates :coach_type, length: { maximum: 20 }
  validates :coach_type, inclusion: { in: Coach::COACH_LAYOUTS.keys }
  validates :base_fare_per_km, numericality: { greater_than: 0 }
  validates :dynamic_multiplier, numericality: { greater_than_or_equal_to: 1 }
  validate :valid_date_range

  private

  def valid_date_range
    return if valid_from.blank? || valid_to.blank?
    return if valid_to >= valid_from

    errors.add(:valid_to, "must be on or after valid_from")
  end
end
