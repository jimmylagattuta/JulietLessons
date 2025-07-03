# app/controllers/api/scripts_controller.rb

module Api
  class ScriptsController < ApplicationController
    # skip CSRF since we’re just stubbing JSON
    skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

    # GET /api/scripts
    def index
      render json: []
    end

    # GET /api/scripts/:id
    def show
      # you could return a dummy object here if you like
      render json: { id: params[:id], title: nil, body: nil, file_url: nil }
    end

    # POST /api/scripts
    def create
      render json: { message: "Create received", script: params.permit(:title, :body) }, status: :created
    end

    # PUT /api/scripts/:id
    def update
      render json: { message: "Update received for #{params[:id]}", updates: params.permit(:title, :body) }
    end

    # DELETE /api/scripts/:id
    def destroy
      head :no_content
    end

    # POST /api/scripts/:id/upload
    def upload
      render json: { message: "Upload received for #{params[:id]}" }
    end
  end
end
