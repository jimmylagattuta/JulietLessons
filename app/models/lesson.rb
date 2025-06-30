class Lesson < ApplicationRecord
  has_many :lesson_parts, dependent: :destroy
  accepts_nested_attributes_for :lesson_parts, allow_destroy: true
end