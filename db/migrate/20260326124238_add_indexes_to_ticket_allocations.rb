class AddIndexesToTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    add_index :ticket_allocations, :seat_id
    add_index :ticket_allocations, :from_stop_id
    add_index :ticket_allocations, :to_stop_id
  end
end