module Api
  class UsersController < ApplicationController
    skip_before_action :verify_authenticity_token

    # POST /api/users/register
    def create
      user = User.new(user_params)
      user.is_active = true

      if user.save
        render json: { user: user.as_json(except: [:password_digest]) }, status: :created
      else
        render json: { error: user.errors.full_messages.join(", ") },
               status: :unprocessable_entity
      end
    end

    private

    def user_params
      params.permit(
        :email,
        :password,
        :first_name,
        :last_name,
        :role,
        :organization
      )
    end
  end
end
