class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :booking, type: :uuid, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :currency, limit: 10, null: false, default: 'INR'
      t.string :payment_method, limit: 50
      t.string :gateway_txn_id, limit: 100
      t.string :status, limit: 20, null: false, default: 'pending'
      t.datetime :paid_at
    end
    add_index :payments, :booking_id, unique: true, name: 'idx_payments_booking'
    add_index :payments, :gateway_txn_id, name: 'idx_payments_gateway_txn'
  end
end
