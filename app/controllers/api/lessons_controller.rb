class Api::LessonsController < ApplicationController
  def random
    lesson = Lesson.includes(:lesson_parts).order('RANDOM()').first
    render json: lesson.as_json(include: :lesson_parts)
  end
end