# app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  has_and_belongs_to_many :lessons

  validates :email, presence: true, uniqueness: true
  validates :first_name, :last_name, :role, presence: true
end