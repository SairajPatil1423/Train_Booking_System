class CreateTrains < ActiveRecord::Migration[7.1]
  def change
    create_table :trains, id: :uuid do |t|
      t.string :train_number, null: false
      t.string :name
      t.string :train_type
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :trains, :train_number, unique: true
  end
end