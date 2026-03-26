class TrainStop < ApplicationRecord

  belongs_to :train
  belongs_to :station


  validates :train_id, presence: true
  validates :station_id, presence: true
  validates :stop_order, presence: true
  validates :distance_from_origin_km, presence: true

  validates :stop_order, uniqueness: { scope: :train_id }
  validates :station_id, uniqueness: { scope: :train_id }

  validate :arrival_before_departure
  validate :first_station_no_arrival

  private

  def arrival_before_departure
    return if arrival_time.blank? || departure_time.blank?

    if arrival_time > departure_time
      errors.add(:arrival_time, "must be before departure time")
    end
  end

  def first_station_no_arrival
    if stop_order == 1 && arrival_time.present?
      errors.add(:arrival_time, "must be nil for first station")
    end
  end

end