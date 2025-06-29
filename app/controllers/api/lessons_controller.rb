class Api::LessonsController < ApplicationController
  def random
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob }).order('RANDOM()').first
    render json: lesson, include: {
      lesson_parts: { methods: :file_infos }
    }
  end
end
