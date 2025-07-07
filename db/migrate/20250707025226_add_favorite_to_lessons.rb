class AddFavoriteToLessons < ActiveRecord::Migration[7.2]
  def change
        add_column :lessons, :favorite, :boolean, default: false, null: false
  end
end
