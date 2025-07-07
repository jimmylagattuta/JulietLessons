# app/controllers/api/lesson_parts_controller.rb
module Api
  class LessonPartsController < ActionController::API
    def create
      lesson_part = LessonPart.new(lesson_part_params)

      if lesson_part.save
        render json: lesson_part, status: :created
      else
        # Log to Heroku so you can see in `heroku logs`
        Rails.logger.error("LessonPart failed to save: #{lesson_part.errors.full_messages.to_sentence}")
        # Return the errors in JSON so your front-end can inspect them in devtools
        render json: { errors: lesson_part.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      lesson_part = LessonPart.find(params[:id])
      if lesson_part.update(lesson_part_params)
        render json: { message: "Lesson Part updated successfully", part: lesson_part }, status: :ok
      else
        render json: { message: "Update failed", errors: lesson_part.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

  def lesson_part_params
    params
      .require(:lesson_part)
      .permit(:section_type, :title, :body, :time, :age_group, :level, tags: [], files: [])
  end

  end
end
