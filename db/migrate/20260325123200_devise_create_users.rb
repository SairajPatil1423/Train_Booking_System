class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      # 🔥 ADD THESE (your schema)
      t.string :phone
      t.string :role, default: "user"

      t.timestamps null: false
    end

    add_index :users, :email, unique: true
  end
end