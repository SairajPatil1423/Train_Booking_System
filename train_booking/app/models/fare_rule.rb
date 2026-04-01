class FareRule < ApplicationRecord
  belongs_to :train

  validates :coach_type, :valid_from, :valid_to, presence: true
  validates :coach_type, inclusion: { in: Coach::COACH_LAYOUTS.keys }
  validates :base_fare_per_km, numericality: { greater_than: 0 }
  validates :dynamic_multiplier, numericality: { greater_than: 0 }
  validate :valid_date_range

  private

  def valid_date_range
    return if valid_from.blank? || valid_to.blank?
    return if valid_to >= valid_from

    errors.add(:valid_to, "must be on or after valid_from")
  end
end
