# app/controllers/api/lesson_parts_controller.rb
module Api
  class LessonPartsController < ActionController::API
    def create
      lesson_part = LessonPart.new(lesson_part_params)

      if lesson_part.save
        render json: lesson_part, status: :created
      else
        render json: { errors: lesson_part.errors.full_messages },
               status: :unprocessable_entity
      end
    end

    private

    def lesson_part_params
      params
        .require(:lesson_part)
        .permit(
          :section_type,
          :title,
          :body,
          :time,
          :age_group,
          :level,
          files: []
        )
    end
  end
end
