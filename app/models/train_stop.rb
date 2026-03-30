class TrainStop < ApplicationRecord
  belongs_to :train
  belongs_to :station
end
