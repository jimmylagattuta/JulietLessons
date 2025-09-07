# app/controllers/api/lessons_controller.rb
class Api::LessonsController < ApplicationController
  before_action :set_lesson, only: %i[show update destroy favorite]

  # GET /api/lessons
  def index
    lessons = Lesson.includes(lesson_parts: { files_attachments: :blob })
    if params[:user_id].present?
      lessons = lessons.joins(:users).where(users: { id: params[:user_id] }).distinct
    end

    render json: lessons, include: { lesson_parts: { methods: :file_infos } }
  end

  # POST /api/lessons/random
  def random
    tags        = params[:tags]      || []
    levels      = params[:levels]    || []
    age_groups  = params[:ageGroups] || []
    search_term = params[:search].to_s.strip

    original_conditions = {
      tags:        tags,
      levels:      levels,
      age_groups:  age_groups,
      search_term: search_term
    }

    Rails.logger.info "🔍 Starting strict match: #{original_conditions.inspect}"

    q = Lesson.joins(:lesson_parts).distinct
    q = q.where("lesson_parts.tags && ARRAY[?]::text[]",      tags)       unless tags.empty?
    q = q.where("lesson_parts.level && ARRAY[?]::text[]",     levels)     unless levels.empty?
    q = q.where("lesson_parts.age_group && ARRAY[?]::text[]", age_groups) unless age_groups.empty?

    unless search_term.blank?
      st = "%#{search_term}%"
      q = q.where(<<~SQL, st: st)
        lessons.title ILIKE :st
        OR lessons.objective ILIKE :st
        OR EXISTS (
          SELECT 1 FROM unnest(lessons.at_a_glance) AS glance
          WHERE glance ILIKE :st
        )
        OR lesson_parts.title ILIKE :st
        OR lesson_parts.body  ILIKE :st
      SQL
    end

    matching_ids = q.pluck("lessons.id")

    if matching_ids.any?
      lesson = Lesson.includes(lesson_parts: { files_attachments: :blob })
                     .find(matching_ids.sample)

      return render json: {
        lesson: full_json(lesson),
        message: nil,
        unmet: [],
        tag_results: {
          tags:        { matched: tags,       unmatched: [] },
          levels:      { matched: levels,     unmatched: [] },
          age_groups:  { matched: age_groups, unmatched: [] },
          search_term: { matched: search_term.present? ? [search_term] : [], unmatched: [] }
        }
      }
    end

    present_filters = original_conditions.select { |_, v| v.present? }.keys
    tag_results = original_conditions.each_with_object({}) do |(k, v), h|
      vals = Array(v)
      h[k] = { matched: [], unmatched: vals }
    end

    render json: {
      lesson:      nil,
      message:     "No lessons found matching the criteria.",
      unmet:       present_filters,
      tag_results: tag_results
    }
  end

  def show
    render json: @lesson.as_json(include: { lesson_parts: { methods: :file_infos } })
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
      render json: lesson, status: :created,
             include: { lesson_parts: { methods: :file_infos } }
    else
      render json: { errors: lesson.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT/PATCH /api/lessons/:id
  def update
    # Accept either a wrapped { lesson: ... } or a flat body
    ids = lesson_params[:lesson_part_ids].presence
    attrs = lesson_params.except(:lesson_part_ids)

    ActiveRecord::Base.transaction do
      # Update basic fields
      @lesson.assign_attributes(attrs)

      # Replace associated parts if client sent IDs (planner-style)
      if ids
        parts = LessonPart.where(id: ids)
        if parts.size != ids.size
          missing = ids.map(&:to_s) - parts.pluck(:id).map(&:to_s)
          raise ActiveRecord::RecordInvalid, "Missing lesson_parts: #{missing.join(', ')}"
        end
        # If you care about custom ordering you’ll want a join model with position.
        # For now we simply replace the association set.
        @lesson.lesson_parts = parts
      end

      @lesson.save!
    end

    render json: @lesson.as_json(include: { lesson_parts: { methods: :file_infos } })
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: Array(e.message) }, status: :unprocessable_entity
  end

  # DELETE /api/lessons/:id
  def destroy
    return render json: { error: "Not found" }, status: :not_found unless @lesson
    @lesson.destroy!
    head :no_content
  end

  # POST   /api/lessons/:id/favorite
  # DELETE /api/lessons/:id/favorite
  def favorite
    # POST → true, DELETE → false
    @lesson.update!(favorite: request.post?)
    head :no_content
  end

  private

  def set_lesson
    @lesson = Lesson.includes(:lesson_parts).find_by(id: params[:id])
    return if @lesson.present?

    render json: { error: "Lesson not found" }, status: :not_found
  end

  # Accepts both:
  #  - { lesson: { ... } }
  #  - { title: ..., objective: ..., at_a_glance: [...], lesson_part_ids: [...] }
  def lesson_params
    raw = if params[:lesson].is_a?(ActionController::Parameters) || params[:lesson].is_a?(Hash)
            params.require(:lesson)
          else
            params
          end

    raw.permit(
      :title,
      :objective,
      :favorite,
      at_a_glance: [],
      lesson_part_ids: [],
      lesson_parts_attributes: [
        :id,
        :section_type,
        :title,
        :body,
        :time,
        :position,
        :_destroy,
        { tags: [] },
        { files: [] },
        # If your model stores arrays for these:
        :age_group,
        :level
      ]
    )
  end

  def full_json(lesson)
    lesson.as_json(include: { lesson_parts: { methods: :file_infos } })
  end
end
