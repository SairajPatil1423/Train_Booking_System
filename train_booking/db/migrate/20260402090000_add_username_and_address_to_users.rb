class AddUsernameAndAddressToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :username, :string, limit: 50
    add_column :users, :address, :text

    add_index :users, :username, unique: true
  end
end
