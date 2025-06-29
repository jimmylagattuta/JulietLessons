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
    puts "*" * 100
    puts "lesson"
    puts lesson.inspect
    puts "*" * 100
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
    # Permit title, objective, and an array of at_a_glance strings
    params.require(:lesson).permit(:title, :objective, at_a_glance: [])
  end
end