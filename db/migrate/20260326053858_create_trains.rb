class CreateTrains < ActiveRecord::Migration[7.1]
  def change
    create_table :trains, id: :uuid do |t|
      t.string :train_number, null: false
      t.string :name, null: false
      t.string :train_type, null: false
      t.boolean :is_active, default: true, null: false

      t.timestamps
    end

    add_index :trains, :train_number, unique: true
  end
end