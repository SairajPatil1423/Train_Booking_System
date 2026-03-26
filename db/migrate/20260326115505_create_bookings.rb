class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :schedule_id, null: false
      t.string :status, null: false, default: "pending"
      t.decimal :total_amount, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_foreign_key :bookings, :users
    add_foreign_key :bookings, :schedules

    add_index :bookings, :user_id
    add_index :bookings, :schedule_id
  end
end