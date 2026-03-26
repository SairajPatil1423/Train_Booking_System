class CreateCancellations < ActiveRecord::Migration[7.1]
  def change
    create_table :cancellations, id: :uuid do |t|
      t.uuid :ticket_allocation_id, null: false
      t.decimal :refund_amount, precision: 10, scale: 2, null: false, default: 0
      t.string :status, null: false, default: "initiated"
      t.datetime :cancelled_at, null: false

      t.timestamps
    end

    add_foreign_key :cancellations, :ticket_allocations

  
    add_index :cancellations, :ticket_allocation_id, unique: true
  end
end