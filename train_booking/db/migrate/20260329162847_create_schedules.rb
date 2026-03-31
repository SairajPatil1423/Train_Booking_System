class CreateSchedules < ActiveRecord::Migration[7.1]
  def change
    create_table :schedules, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :train, type: :uuid, null: false, foreign_key: true, index: { name: 'idx_schedules_train' }
      t.date :travel_date, null: false
      t.time :departure_time, null: false
      t.time :expected_arrival_time, null: false
      t.string :status, limit: 20, null: false, default: 'scheduled'
      t.integer :delay_minutes, null: false, default: 0
      t.datetime :created_at, null: false, default: -> { 'NOW()' }
    end
    add_index :schedules, [:train_id, :travel_date], unique: true, name: 'idx_schedules_train_date'
    add_index :schedules, :travel_date, name: 'idx_schedules_date'
  end
end
