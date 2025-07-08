# app/controllers/api/lesson_planning_controller.rb
module Api
  class LessonPlanningController < ActionController::API
    def index
      parts = LessonPart.all.map do |p|
        {
          id:           p.id,
          title:        p.title,
          body:         p.body,
          section_type: p.section_type,
          age_group:    p.age_group,
          level:        p.level,
          time:         p.time,
          tags:         p.tags,
          file_infos:   p.file_infos    # ← add this line
        }
      end

      render json: {
        message: 'API call received',
        parts:   parts
      }
    end
  end
end
