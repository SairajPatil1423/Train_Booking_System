class CreateTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    create_table :ticket_allocations, id: :uuid do |t|
      t.uuid :booking_id, null: false
      t.uuid :passenger_id, null: false
      t.uuid :seat_id, null: false
      t.uuid :from_stop_id, null: false
      t.uuid :to_stop_id, null: false
      t.string :status, null: false, default: "allocated"

      t.timestamps
    end

    add_foreign_key :ticket_allocations, :bookings
    add_foreign_key :ticket_allocations, :passengers
    add_foreign_key :ticket_allocations, :seats

    
    add_index :ticket_allocations, :passenger_id, unique: true

    
    add_index :ticket_allocations, :seat_id, unique: true
  end
end