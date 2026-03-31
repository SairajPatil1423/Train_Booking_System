class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_bookings_user' }
      t.references :schedule, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_bookings_schedule' }
      t.references :src_station, type: :uuid, null: false, foreign_key: { to_table: :stations }
      t.references :dst_station, type: :uuid, null: false, foreign_key: { to_table: :stations }
      t.string :booking_ref, limit: 20, null: false
      t.string :status, limit: 20, null: false, default: 'pending'
      t.decimal :total_fare, precision: 10, scale: 2, null: false, default: 0
      t.datetime :booked_at, null: false, default: -> { 'NOW()' }
    end
    add_index :bookings, :booking_ref, unique: true, name: 'idx_bookings_ref'
  end
end
