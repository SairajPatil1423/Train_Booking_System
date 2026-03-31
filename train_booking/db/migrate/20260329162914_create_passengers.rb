class CreatePassengers < ActiveRecord::Migration[7.1]
  def change
    create_table :passengers, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :booking, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_passengers_booking' }
      t.string :first_name, limit: 100, null: false
      t.string :last_name, limit: 100, null: false
      t.integer :age, null: false
      t.string :gender, limit: 10, null: false
      t.string :id_type, limit: 50
      t.string :id_number, limit: 100
    end
  end
end
