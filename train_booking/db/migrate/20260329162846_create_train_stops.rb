class CreateTrainStops < ActiveRecord::Migration[7.1]
  def change
    create_table :train_stops, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :train, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_train_stops_train' }
      t.references :station, type: :uuid, null: false, foreign_key: true
      t.integer :stop_order, null: false
      t.time :arrival_time
      t.time :departure_time
      t.integer :distance_from_origin_km, null: false, default: 0
    end
    add_index :train_stops, [:train_id, :stop_order], unique: true, name: 'idx_train_stops_order'
    add_index :train_stops, [:train_id, :station_id], unique: true, name: 'idx_train_stops_station'
  end
end
