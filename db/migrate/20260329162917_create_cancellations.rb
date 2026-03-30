class CreateCancellations < ActiveRecord::Migration[7.1]
  def change
    create_table :cancellations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :booking, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_cancellations_booking' }
      t.references :ticket_allocation, type: :uuid, foreign_key: true, index: { name: 'idx_cancellations_allocation' }
      t.references :requested_by, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.text :reason
      t.decimal :refund_amount, precision: 10, scale: 2, null: false, default: 0
      t.string :status, limit: 20, null: false, default: 'pending'
      t.datetime :cancelled_at, null: false, default: -> { 'NOW()' }
    end
  end
end
