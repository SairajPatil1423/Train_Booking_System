class AddStopIdsToTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    add_column :ticket_allocations, :src_stop_id, :uuid, null: false
    add_column :ticket_allocations, :dst_stop_id, :uuid, null: false

    add_foreign_key :ticket_allocations, :train_stops, column: :src_stop_id
    add_foreign_key :ticket_allocations, :train_stops, column: :dst_stop_id

    add_index :ticket_allocations, :src_stop_id
    add_index :ticket_allocations, :dst_stop_id
  end
end