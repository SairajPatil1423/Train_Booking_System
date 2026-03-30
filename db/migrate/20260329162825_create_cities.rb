class CreateCities < ActiveRecord::Migration[7.1]
  def change
    create_table :cities, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :name, limit: 100, null: false
      t.string :state, limit: 100
      t.string :country, limit: 100, null: false
    end
    add_index :cities, [:name, :state, :country], unique: true, name: 'idx_cities_name_state_country'
  end
end
