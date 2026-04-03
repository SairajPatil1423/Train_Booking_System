class TrainStop < ApplicationRecord
  belongs_to :train
  belongs_to :station

  validates :stop_order, numericality: { greater_than: 0 }
  validates :distance_from_origin_km, numericality: { greater_than_or_equal_to: 0 }
  validate :chronology_is_valid

  def sync_time_columns_from_datetimes
    self.arrival_time = arrival_at&.strftime("%H:%M:%S")
    self.departure_time = departure_at&.strftime("%H:%M:%S")
  end

  private

  def chronology_is_valid
    return if arrival_at.blank? || departure_at.blank?
    return if departure_at >= arrival_at

    errors.add(:departure_at, "must be after or equal to arrival_at")
  end
end
