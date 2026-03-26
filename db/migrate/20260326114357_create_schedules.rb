class CreateSchedules < ActiveRecord::Migration[7.1]
  def change
    create_table :schedules, id: :uuid do |t|
      t.uuid :train_id, null: false
      t.date :journey_date, null: false
      t.string :status, null: false, default: "scheduled"
      t.integer :total_distance_km, null: false

      t.timestamps
    end

    add_foreign_key :schedules, :trains

   
    add_index :schedules, [:train_id, :journey_date], unique: true
  end
end