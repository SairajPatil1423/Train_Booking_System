class CreateStations < ActiveRecord::Migration[7.1]
  def change

    create_table :stations, id: :uuid do |t|
      t.string :name
      t.string :code
      t.uuid :city_id
      t.decimal :latitude
      t.decimal :longitude

      t.timestamps
    end
  end
end
