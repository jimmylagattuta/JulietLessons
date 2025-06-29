class CreateLessonParts < ActiveRecord::Migration[7.2]
  def change
    create_table :lesson_parts do |t|
      t.references :lesson, null: false, foreign_key: true
      t.integer :section_type
      t.string :title
      t.text :body
      t.integer :position
      t.integer :time
      t.text :tags, array: true, default: []

      t.timestamps
    end
  end
end