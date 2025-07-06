class MigrateLegacyLessonPartAssociations < ActiveRecord::Migration[7.2]
  def up
    say_with_time "Migrating legacy lesson_part.lesson_id into join table" do
      LessonPart.where.not(lesson_id: nil).find_each do |lp|
        lesson = Lesson.find_by(id: lp.lesson_id)
        next unless lesson

        # Add to join table
        lesson.lesson_parts << lp unless lesson.lesson_parts.include?(lp)
      end
    end
  end

  def down
    say_with_time "Rolling back legacy lesson_part.lesson_id migration" do
      execute <<-SQL.squish
        DELETE FROM lessons_lesson_parts;
      SQL
    end
  end
end
