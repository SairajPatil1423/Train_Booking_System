class CreateTrainStops < ActiveRecord::Migration[7.1]
  def change
    create_table :train_stops, id: :uuid do |t|
      t.uuid :train_id, null: false
      t.uuid :station_id, null: false
      t.integer :stop_order, null: false
      t.time :arrival_time
      t.time :departure_time
      t.integer :distance_from_origin_km, null: false

      t.timestamps
    end

    add_foreign_key :train_stops, :trains
    add_foreign_key :train_stops, :stations

    add_index :train_stops, [:train_id, :stop_order], unique: true
    add_index :train_stops, [:train_id, :station_id], unique: true
  end
end