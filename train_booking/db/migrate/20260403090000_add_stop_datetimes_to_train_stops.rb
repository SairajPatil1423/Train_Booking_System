class AddStopDatetimesToTrainStops < ActiveRecord::Migration[7.1]
  def up
    add_column :train_stops, :arrival_at, :datetime
    add_column :train_stops, :departure_at, :datetime

    execute <<~SQL.squish
      UPDATE train_stops
      SET arrival_at = CASE
        WHEN arrival_time IS NOT NULL THEN TIMESTAMP '2000-01-01' + arrival_time
        ELSE NULL
      END,
      departure_at = CASE
        WHEN departure_time IS NOT NULL THEN TIMESTAMP '2000-01-01' + departure_time
        ELSE NULL
      END
    SQL
  end

  def down
    remove_column :train_stops, :arrival_at
    remove_column :train_stops, :departure_at
  end
end
