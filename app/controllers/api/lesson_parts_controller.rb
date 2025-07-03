class Api::LessonPartsController < ApplicationController
  def create
    puts "*" * 100
    puts "new lesson part params"
    puts params.inspect
    puts "*" * 100

    render json: {
      message: "Received lesson part creation request",
      received: params.to_unsafe_h
    }, status: :ok
  end
end
