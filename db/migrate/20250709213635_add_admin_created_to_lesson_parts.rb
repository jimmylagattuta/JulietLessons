class AddAdminCreatedToLessonParts < ActiveRecord::Migration[6.1]
  def change
    add_column :lesson_parts, :admin_created, :boolean, default: false, null: false
  end
end