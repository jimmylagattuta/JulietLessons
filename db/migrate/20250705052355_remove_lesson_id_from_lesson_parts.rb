class RemoveLessonIdFromLessonParts < ActiveRecord::Migration[7.2]
  def change
    remove_column :lesson_parts, :lesson_id, :bigint
  end
end
