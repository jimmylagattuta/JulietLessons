class Api::LessonsController < ApplicationController
  def index
    lessons = Lesson.includes(lesson_parts: { files_attachments: :blob })

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

  def show
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                   .find(params[:id])

    render json: lesson,
           include: { lesson_parts: { methods: :file_infos } }
  end

  def create
    puts "*" * 100
    puts "params"
    puts params.inspect
    puts "*" * 100

    render json: { message: "Lesson received!" }, status: :ok
    # # Flatten sectionParts object into lesson_parts_attributes
    # raw_parts_by_section = params[:parts_by_section] || {}
    # lesson_parts_attributes = raw_parts_by_section.values.flatten.map.with_index do |part, idx|
    #   {
    #     section_type: part[:section_type],
    #     title:        part[:title],
    #     body:         part[:body],
    #     time:         part[:time],
    #     position:     idx
    #   }
    # end

    # lesson = Lesson.new(
    #   title: params[:title],
    #   objective: params[:objective],
    #   at_a_glance: params[:at_a_glance],
    #   lesson_parts_attributes: lesson_parts_attributes
    # )

    # if params[:user_id].present?
    #   user = User.find_by(id: params[:user_id])
    #   lesson.users << user if user
    # end

    # if lesson.save
    #   render json: lesson,
    #          status: :created,
    #          include: { lesson_parts: { methods: :file_infos } }
    # else
    #   render json: { errors: lesson.errors.full_messages },
    #          status: :unprocessable_entity
    # end
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
        files: []
      ]
    )
  end
end
