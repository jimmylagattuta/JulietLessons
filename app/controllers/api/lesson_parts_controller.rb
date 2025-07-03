module Api
  class LessonPartsController < ApplicationController
    # If you’re using cookies-based CSRF, you can disable it for API calls:
    protect_from_forgery with: :null_session

    def create
      @lesson_part = LessonPart.new(lesson_part_params)

      if @lesson_part.save
        render json: @lesson_part, status: :created
      else
        render json: { errors: @lesson_part.errors.full_messages },
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
          files: []            # permit an array of attached PDFs
        )
    end
  end
end
