# app/controllers/api/lesson_parts_controller.rb
module Api
  class LessonPartsController < ActionController::API
    before_action :set_part, only: [:show, :update]

    # GET /api/lesson_parts/:id
    def show
      render json: @part, methods: [:file_infos], status: :ok
    end

    # POST /api/lesson_parts
    def create
      lesson_part = LessonPart.new(lesson_part_params)

      if lesson_part.save
        render json: lesson_part, methods: [:file_infos], status: :created
      else
        Rails.logger.error("LessonPart failed to save: #{lesson_part.errors.full_messages.to_sentence}")
        render json: { errors: lesson_part.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/lesson_parts/:id
    def update
      # 1) pull out any file-IDs the client wants to remove
      remove_ids = params.delete(:remove_file_ids) || []

      # 2) pull out new uploads so update() doesn’t replace all attachments
      lp_params = lesson_part_params.dup
      new_files = lp_params.delete(:files)

      if @part.update(lp_params)
        # 3) purge attachments flagged for removal
        Array(remove_ids).each do |aid|
          attach = @part.files.find_by(id: aid)
          attach&.purge
        end

        # 4) attach any newly-uploaded files
        Array(new_files).each { |f| @part.files.attach(f) } if new_files.present?

        @part.reload
        render json: @part, methods: [:file_infos], status: :ok
      else
        render json: { message: "Update failed", errors: @part.errors.full_messages },
               status: :unprocessable_entity
      end
    end

    private

    def set_part
      @part = LessonPart.find(params[:id])
    end

    def lesson_part_params
      params.require(:lesson_part).permit(
        :section_type, :title, :body, :time, :age_group, :level,
        tags: [],
        files: []   # for newly-uploaded PDFs
      )
    end
  end
end
