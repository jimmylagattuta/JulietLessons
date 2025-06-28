class CreateLessons < ActiveRecord::Migration[7.2]
  def change
    create_table :lessons do |t|
      t.string :title
      t.text :objective
      t.text :at_a_glance, array: true, default: []

      t.timestamps
    end
  end
end
