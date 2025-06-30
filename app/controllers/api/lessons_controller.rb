# app/controllers/api/lessons_controller.rb
class Api::LessonsController < ApplicationController
  # GET /api/lessons/random
  def random
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                   .order('RANDOM()')
                   .first

    render json: lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # POST /api/lessons
  def create
    lesson = Lesson.new(lesson_params)

    if lesson.save
      render json: lesson,
             status: :created,
             include: { lesson_parts: { methods: :file_infos } }
    else
      render json: { errors: lesson.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

  def lesson_params
    params.require(:lesson).permit(
      :title,
      :objective,
      at_a_glance: [],

      # allow nested lesson_parts + attachments
      lesson_parts_attributes: [
        :section_type,
        :title,
        :body,
        :time,
        :position,
        :_destroy,
        files: []          # if you’re sending PDFs in multipart
      ]
    )
  end
end