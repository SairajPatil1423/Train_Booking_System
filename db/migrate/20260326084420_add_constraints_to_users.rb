class AddConstraintsToUsers < ActiveRecord::Migration[7.1]
  def change
    change_column_null :users, :email, false
    change_column_null :users, :encrypted_password, false
    change_column_null :users, :role, false

    
  end
end