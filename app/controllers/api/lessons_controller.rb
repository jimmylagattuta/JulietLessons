class Api::LessonsController < ApplicationController
  def random
    lesson = Lesson.includes(lesson_parts: { file_attachment: :blob }).order('RANDOM()').first
    render json: lesson, include: {
      lesson_parts: { methods: :file_url }
    }
  end
end