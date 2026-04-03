class AddFullNameToUsers < ActiveRecord::Migration[7.1]
  def up
    add_column :users, :full_name, :string, limit: 120

    execute <<~SQL.squish
      UPDATE users
      SET full_name = COALESCE(NULLIF(username, ''), split_part(email, '@', 1))
      WHERE full_name IS NULL OR full_name = ''
    SQL

    change_column_null :users, :full_name, false
  end

  def down
    remove_column :users, :full_name
  end
end
