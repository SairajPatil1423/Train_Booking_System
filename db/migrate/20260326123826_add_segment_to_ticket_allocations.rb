class AddSegmentToTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    add_column :ticket_allocations, :from_stop_id, :uuid, null: false
    add_column :ticket_allocations, :to_stop_id, :uuid, null: false

    add_foreign_key :ticket_allocations, :train_stops, column: :from_stop_id
    add_foreign_key :ticket_allocations, :train_stops, column: :to_stop_id
  end
end