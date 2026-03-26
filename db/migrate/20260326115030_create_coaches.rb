class CreateCoaches < ActiveRecord::Migration[7.1]
  def change
    create_table :coaches, id: :uuid do |t|
      t.uuid :schedule_id, null: false
      t.string :coach_number, null: false
      t.string :coach_type, null: false
      t.integer :total_seats, null: false

      t.timestamps
    end

    add_foreign_key :coaches, :schedules

    add_index :coaches, [:schedule_id, :coach_number], unique: true
  end
end