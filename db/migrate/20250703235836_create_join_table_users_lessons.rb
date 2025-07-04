class CreateJoinTableUsersLessons < ActiveRecord::Migration[7.0]
  def change
    create_join_table :users, :lessons do |t|
      t.index [:user_id, :lesson_id]  # This allows each user to have each lesson once
      t.index [:lesson_id, :user_id]  # Optional, helps with reverse lookups
    end
  end
end
