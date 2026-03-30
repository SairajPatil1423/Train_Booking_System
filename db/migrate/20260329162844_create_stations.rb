class CreateStations < ActiveRecord::Migration[7.1]
  def change
    create_table :stations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :city, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_stations_city' }
      t.string :name, limit: 100, null: false
      t.string :code, limit: 20, null: false
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
    end
    add_index :stations, :code, unique: true, name: 'idx_stations_code'
  end
end
