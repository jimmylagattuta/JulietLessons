class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_digest
      t.string :first_name
      t.string :last_name
      t.string :role
      t.string :organization
      t.boolean :is_active
      t.datetime :last_login_at
      t.string :stripe_customer_id

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
