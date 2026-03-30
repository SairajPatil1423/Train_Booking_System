class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :email,              null: false, limit: 255
      t.string :phone,              limit: 20
      t.string :role,               null: false, default: 'user', limit: 20
      t.string :encrypted_password, null: false, limit: 255

      t.timestamps null: false
    end

    add_index :users, :email, unique: true, name: "idx_users_email"
  end
end
