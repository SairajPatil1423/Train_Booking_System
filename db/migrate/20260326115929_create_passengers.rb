class CreatePassengers < ActiveRecord::Migration[7.1]
  def change
    create_table :passengers, id: :uuid do |t|
      t.uuid :booking_id, null: false
      t.string :name, null: false
      t.integer :age, null: false
      t.string :gender, null: false

      t.timestamps
    end

    add_foreign_key :passengers, :bookings
    add_index :passengers, :booking_id
  end
end