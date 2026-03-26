class CreateSeats < ActiveRecord::Migration[7.1]
  def change
    create_table :seats, id: :uuid do |t|
      t.uuid :coach_id, null: false
      t.string :seat_number, null: false
      t.string :seat_type, null: false
      t.boolean :is_available, null: false, default: true

      t.timestamps
    end

    add_foreign_key :seats, :coaches

  
    add_index :seats, [:coach_id, :seat_number], unique: true
  end
end