# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  validates :email,      presence: true, uniqueness: true
  validates :first_name, :last_name, presence: true
  validates :role,       presence: true, inclusion: { in: %w[teacher student] }
end
