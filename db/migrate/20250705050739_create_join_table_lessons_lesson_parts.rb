class CreateJoinTableLessonsLessonParts < ActiveRecord::Migration[7.2]
  def change
    create_join_table :lessons, :lesson_parts do |t|
      t.index [:lesson_id, :lesson_part_id], unique: true
      t.index [:lesson_part_id, :lesson_id]
    end
  end
end
