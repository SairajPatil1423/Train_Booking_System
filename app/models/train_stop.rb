class TrainStop < ApplicationRecord
  belongs_to :train
  belongs_to :station

  validates :stop_order, numericality: { greater_than: 0 }
  validates :distance_from_origin_km, numericality: { greater_than_or_equal_to: 0 }
end
