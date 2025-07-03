# app/controllers/api/lesson_planning_controller.rb
module Api
  class LessonPlanningController < ActionController::API
    def index
      puts "*" * 100
      puts "params for new lesson planning"
      puts params.inspect
      puts "*" * 100
      render json: { message: 'API call received' }
    end
  end
end
