class CreateSeats < ActiveRecord::Migration[7.1]
  def change
    create_table :seats, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :coach, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_seats_coach' }
      t.string :seat_number, limit: 10, null: false
      t.string :seat_type, limit: 20, null: false
      t.boolean :is_active, null: false, default: true
    end
    add_index :seats, [:coach_id, :seat_number], unique: true, name: 'idx_seats_coach_number'
  end
end
