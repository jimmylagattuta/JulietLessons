# app/models/lesson.rb
class Lesson < ApplicationRecord
  has_and_belongs_to_many :users

  has_and_belongs_to_many :lesson_parts
  accepts_nested_attributes_for :lesson_parts, allow_destroy: true
end