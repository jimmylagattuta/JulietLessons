class CreateSubscriptions < ActiveRecord::Migration[7.2]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :status
      t.decimal :total_spent_on_lessons

      t.timestamps
    end
  end
end
