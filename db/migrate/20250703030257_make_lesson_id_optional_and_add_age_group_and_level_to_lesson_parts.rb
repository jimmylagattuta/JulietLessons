# db/migrate/XXXXXXXXXX_make_lesson_id_optional_and_add_age_group_and_level_to_lesson_parts.rb
class MakeLessonIdOptionalAndAddAgeGroupAndLevelToLessonParts < ActiveRecord::Migration[7.2]
  def change
    change_column_null :lesson_parts, :lesson_id, true

    add_column :lesson_parts, :age_group, :string
    add_column :lesson_parts, :level, :string
  end
end
