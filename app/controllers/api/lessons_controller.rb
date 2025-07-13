# app/controllers/api/lessons_controller.rb
class Api::LessonsController < ApplicationController


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




# POST /api/lessons/random
def random
  tags        = params[:tags]      || []
  levels      = params[:levels]    || []
  age_groups  = params[:ageGroups] || []
  search_term = params[:search].to_s.strip

  original_conditions = {
    tags: tags,
    levels: levels,
    age_groups: age_groups,
    search_term: search_term
  }

  puts "🔍 Starting strict match"
  puts "Original filters: #{original_conditions.inspect}"

  build_query = ->(skip_key = nil) {
    q = Lesson.joins(:lesson_parts).distinct

    unless tags.empty? || skip_key == :tags
      q = q.where("lesson_parts.tags @> ?", "{#{tags.map(&:to_s).join(',')}}")
    end

    unless levels.empty? || skip_key == :levels
      q = q.where("lesson_parts.level @> ?", "{#{levels.map(&:to_s).join(',')}}")
    end

    unless age_groups.empty? || skip_key == :age_groups
      q = q.where("lesson_parts.age_group @> ?", "{#{age_groups.map(&:to_s).join(',')}}")
    end

    unless search_term.blank? || skip_key == :search_term
      q = q.where("lessons.title ILIKE ?", "%#{search_term}%")
    end

    q
  }

  # 1) Strict match
  matching_ids = build_query.call.pluck("lessons.id")
  if matching_ids.any?
    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob }).find(matching_ids.sample)

    render json: {
      lesson: full_json(lesson),
      message: nil,
      unmet: [],
      tag_results: {
        tags: {
          matched: tags,
          unmatched: []
        },
        levels: {
          matched: levels,
          unmatched: []
        },
        age_groups: {
          matched: age_groups,
          unmatched: []
        },
        search_term: {
          matched: search_term.present? ? [search_term] : [],
          unmatched: []
        }
      }
    } and return
  end

  # 2) Partial match
  [:search_term, :tags, :levels, :age_groups].each do |key|
    ids = build_query.call(key).pluck("lessons.id")
    next if ids.empty?

    lesson = Lesson.includes(lesson_parts: { files_attachments: :blob }).find(ids.sample)
    parts = lesson.lesson_parts

    part_tags   = parts.flat_map(&:tags).uniq
    part_levels = parts.flat_map(&:level).uniq
    part_ages   = parts.flat_map(&:age_group).uniq

    matched_tags   = tags & part_tags
    unmatched_tags = tags - matched_tags

    matched_levels   = levels & part_levels
    unmatched_levels = levels - matched_levels

    matched_ages   = age_groups & part_ages
    unmatched_ages = age_groups - matched_ages

    matched_search = search_term.present? && lesson.title.downcase.include?(search_term.downcase) ? [search_term] : []
    unmatched_search = search_term.present? && matched_search.empty? ? [search_term] : []

    unmet = original_conditions.keys.select { |k| k != key && original_conditions[k].present? }

    render json: {
      lesson: full_json(lesson),
      message: "Found partial match by ignoring #{key.to_s.humanize}.",
      unmet: unmet,
      tag_results: {
        tags: {
          matched: matched_tags,
          unmatched: unmatched_tags
        },
        levels: {
          matched: matched_levels,
          unmatched: unmatched_levels
        },
        age_groups: {
          matched: matched_ages,
          unmatched: unmatched_ages
        },
        search_term: {
          matched: matched_search,
          unmatched: unmatched_search
        }
      }
    } and return
  end

  # 3) Best-match fallback
  scored = Lesson.includes(lesson_parts: { files_attachments: :blob }).map do |les|
    parts = les.lesson_parts
    part_tags   = parts.flat_map(&:tags).uniq
    part_levels = parts.flat_map(&:level).uniq
    part_ages   = parts.flat_map(&:age_group).uniq

    matched_tags   = tags & part_tags
    unmatched_tags = tags - matched_tags

    matched_levels   = levels & part_levels
    unmatched_levels = levels - matched_levels

    matched_ages   = age_groups & part_ages
    unmatched_ages = age_groups - matched_ages

    matched_search = search_term.present? && les.title.downcase.include?(search_term.downcase) ? [search_term] : []
    unmatched_search = search_term.present? && matched_search.empty? ? [search_term] : []

    score_map = {
      tags: matched_tags.size,
      levels: matched_levels.size,
      age_groups: matched_ages.size,
      search_term: matched_search.any? ? 1 : 0
    }

    {
      lesson: les,
      scores: score_map,
      total: score_map.values.sum,
      tag_results: {
        tags: {
          matched: matched_tags,
          unmatched: unmatched_tags
        },
        levels: {
          matched: matched_levels,
          unmatched: unmatched_levels
        },
        age_groups: {
          matched: matched_ages,
          unmatched: unmatched_ages
        },
        search_term: {
          matched: matched_search,
          unmatched: unmatched_search
        }
      }
    }
  end

  best = scored.max_by { |s| s[:total] }
  if best[:total] > 0
    best_lesson = best[:lesson]
    unmet = original_conditions.keys.select do |k|
      best[:scores][k] < (original_conditions[k].is_a?(Array) ? original_conditions[k].size : 1)
    end

    render json: {
      lesson: full_json(best_lesson),
      message: "Showing best available match.",
      unmet: unmet,
      tag_results: best[:tag_results]
    } and return
  end

  # 4) No match at all
  render json: {
    lesson: nil,
    message: "No lessons found matching the criteria.",
    unmet: original_conditions.select { |_, v| v.present? }.keys,
    tag_results: {
      tags: {
        matched: [],
        unmatched: tags
      },
      levels: {
        matched: [],
        unmatched: levels
      },
      age_groups: {
        matched: [],
        unmatched: age_groups
      },
      search_term: {
        matched: [],
        unmatched: search_term.present? ? [search_term] : []
      }
    }
  }
end


  private

  def full_json(lesson)
    lesson.as_json(include: { lesson_parts: { methods: :file_infos } })
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
