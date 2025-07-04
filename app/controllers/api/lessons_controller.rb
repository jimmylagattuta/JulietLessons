# app/controllers/api/lessons_controller.rb
class Api::LessonsController < ApplicationController
  def index
    lessons = Lesson.includes(lesson_parts: { files_attachments: :blob })

    # Optional: filter by user ID (if you want to support ?userId=123)
    if params[:userId]
      lessons = lessons.joins(:users).where(users: { id: params[:userId] }).distinct
    end

    render json: lessons,
           include: { lesson_parts: { methods: :file_infos } }
  end

  def random
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                   .order('RANDOM()')
                   .first

    render json: lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # GET /api/lessons/:id
  def show
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                   .find(params[:id])

    render json: lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # POST /api/lessons
  def create
    lesson = Lesson.new(lesson_params)

    # Associate user if user_id is passed (e.g. from frontend session or payload)
    if params[:user_id].present?
      user = User.find_by(id: params[:user_id])
      lesson.users << user if user
    end

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
      lesson_parts_attributes: [
        :section_type,
        :title,
        :body,
        :time,
        :position,
        :_destroy,
        files: []  # accepts attached files
      ]
    )
  end
end
