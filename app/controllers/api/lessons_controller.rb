class Api::LessonsController < ApplicationController
    def random
        lesson = Lesson.order('RANDOM()').first
        render json: lesson
    end
end
