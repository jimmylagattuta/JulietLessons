class BackfillLessonPartTags < ActiveRecord::Migration[7.1]
  def change
    change_column :lesson_parts, :level, :text, array: true, default: [], using: "ARRAY[level]"
    change_column :lesson_parts, :age_group, :text, array: true, default: [], using: "ARRAY[age_group]"
  end
end