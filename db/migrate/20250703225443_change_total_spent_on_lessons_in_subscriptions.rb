class ChangeTotalSpentOnLessonsInSubscriptions < ActiveRecord::Migration[7.2]
  def change
    change_column :subscriptions, :total_spent_on_lessons, :decimal, precision: 10, scale: 2, default: 0.0
  end
end
