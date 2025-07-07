# app/controllers/api/lessons_controller.rb
class Api::LessonsController < ApplicationController
  before_action :set_lesson, only: %i[show destroy favorite]

  # GET /api/lessons
  def index
    lessons = Lesson.includes(lesson_parts: { files_attachments: :blob })
    if params[:user_id].present?
      lessons = lessons
        .joins(:users)
        .where(users: { id: params[:user_id] })
        .distinct
    end

    render json: lessons,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # GET /api/lessons/random
  def random
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                   .order('RANDOM()')
                   .first

    render json: lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # GET /api/lessons/:id
  def show
    render json: @lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  # POST /api/lessons
  def create
    Rails.logger.debug "lesson_params: #{lesson_params.inspect}"

    lesson = Lesson.new(lesson_params)
    if params[:user_id].present?
      if (user = User.find_by(id: params[:user_id]))
        lesson.users << user
      end
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

  # DELETE /api/lessons/:id
  def destroy
    @lesson.destroy
    head :no_content
  end

  # POST   /api/lessons/:id/favorite
  # DELETE /api/lessons/:id/favorite
  def favorite
    puts "favorite"
    # if called via POST → set favorite true; via DELETE → set favorite false
    @lesson.update!(favorite: request.post?)
    head :no_content
  end

  private

  def set_lesson
    @lesson = Lesson.find(params[:id])
  end

  def lesson_params
    params.require(:lesson).permit(
      :title,
      :objective,
      :favorite,                    # now permitted if you ever mass-assign
      at_a_glance: [],
      lesson_part_ids: [],
      lesson_parts_attributes: [
        :id,
        :section_type,
        :title,
        :body,
        :time,
        :position,
        :age_group,
        :level,
        { tags: [] },
        { files: [] },
        :_destroy
      ]
    )
  end
end
