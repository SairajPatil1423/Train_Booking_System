class CreateTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    create_table :ticket_allocations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :booking, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_ticket_alloc_booking' }
      t.references :passenger, type: :uuid, null: false, foreign_key: true
      t.references :seat, type: :uuid, null: false, foreign_key: true
      t.references :schedule, type: :uuid, null: false, foreign_key: true
      t.references :src_station, type: :uuid, null: false, foreign_key: { to_table: :stations }
      t.references :dst_station, type: :uuid, null: false, foreign_key: { to_table: :stations }
      
      t.integer :src_stop_order, null: false
      t.integer :dst_stop_order, null: false
      
      t.string :pnr, limit: 20, null: false
      t.decimal :fare, precision: 10, scale: 2, null: false
      t.string :status, limit: 20, null: false, default: 'confirmed'
    end

    add_index :ticket_allocations, :pnr, unique: true, name: 'idx_ticket_alloc_pnr'
    add_index :ticket_allocations, [:booking_id, :passenger_id], unique: true, name: 'idx_ticket_alloc_passenger'
    add_index :ticket_allocations, [:seat_id, :schedule_id], name: 'idx_ticket_alloc_seat_schedule'
    
    reversible do |dir|
      dir.up do
        execute("ALTER TABLE ticket_allocations ADD CONSTRAINT ticket_allocations_stop_order_check CHECK (dst_stop_order > src_stop_order)")
      end
      dir.down do
        execute("ALTER TABLE ticket_allocations DROP CONSTRAINT ticket_allocations_stop_order_check")
      end
    end
  end
end
