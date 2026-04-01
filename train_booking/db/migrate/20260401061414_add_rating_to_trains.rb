class AddRatingToTrains < ActiveRecord::Migration[7.1]
  def change
    add_column :trains, :rating, :decimal, precision: 4, scale: 2
    add_column :trains, :grade, :string
  end
end
