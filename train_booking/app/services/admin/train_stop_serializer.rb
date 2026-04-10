module Admin
  class TrainStopSerializer
    def self.serialize(train_stop)
      train_stop.as_json(include: {
        train: { only: %i[id train_number name train_type] },
        station: {
          only: %i[id name code],
          include: {
            city: { only: %i[id name state country] }
          }
        }
      }).merge(
        arrival_at: train_stop.arrival_at,
        departure_at: train_stop.departure_at
      )
    end
  end
end
