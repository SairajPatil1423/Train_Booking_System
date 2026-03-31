class CreateTrains < ActiveRecord::Migration[7.1]
  def change
    create_table :trains, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :train_number, limit: 20, null: false
      t.string :name, limit: 100, null: false
      t.string :train_type, limit: 50, null: false
      t.boolean :is_active, null: false, default: true
      t.datetime :created_at, null: false, default: -> { 'NOW()' }
    end
    add_index :trains, :train_number, unique: true, name: 'idx_trains_number'
  end
end
