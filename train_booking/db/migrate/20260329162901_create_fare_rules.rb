class CreateFareRules < ActiveRecord::Migration[7.1]
  def change
    create_table :fare_rules, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :train, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_fare_rules_train' }
      t.string :coach_type, limit: 20, null: false
      t.decimal :base_fare_per_km, precision: 10, scale: 2, null: false
      t.decimal :dynamic_multiplier, precision: 5, scale: 2, null: false, default: 1.0
      t.date :valid_from, null: false
      t.date :valid_to, null: false
    end
    add_index :fare_rules, [:train_id, :coach_type, :valid_from], unique: true, name: 'idx_fare_rules_unique'
    
    reversible do |dir|
      dir.up do
        execute("ALTER TABLE fare_rules ADD CONSTRAINT fare_rules_dates_check CHECK (valid_to >= valid_from)")
      end
      dir.down do
        execute("ALTER TABLE fare_rules DROP CONSTRAINT fare_rules_dates_check")
      end
    end
  end
end
