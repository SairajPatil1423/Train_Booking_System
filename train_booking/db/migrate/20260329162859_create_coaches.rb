class CreateCoaches < ActiveRecord::Migration[7.1]
  def change
    create_table :coaches, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :train, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_coaches_train' }
      t.string :coach_number, limit: 10, null: false
      t.string :coach_type, limit: 20, null: false
      t.integer :total_seats, null: false
    end
    add_index :coaches, [:train_id, :coach_number], unique: true, name: 'idx_coaches_train_number'
  end
end
