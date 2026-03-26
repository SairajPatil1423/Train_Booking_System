class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments, id: :uuid do |t|
      t.uuid :booking_id, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :status, null: false, default: "pending"
      t.string :payment_method, null: false
      t.string :transaction_id

      t.timestamps
    end

    add_foreign_key :payments, :bookings

    
    add_index :payments, :booking_id, unique: true

    
    add_index :payments, :transaction_id, unique: true
  end
end