class Lesson < ApplicationRecord
  has_many :lesson_parts, dependent: :destroy
end