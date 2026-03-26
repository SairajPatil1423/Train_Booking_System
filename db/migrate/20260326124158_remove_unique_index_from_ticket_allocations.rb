class RemoveUniqueIndexFromTicketAllocations < ActiveRecord::Migration[7.1]
  def change
    remove_index :ticket_allocations, :seat_id
  end
end