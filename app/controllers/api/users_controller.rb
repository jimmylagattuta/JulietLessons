# app/controllers/api/users_controller.rb
module Api
  class UsersController < ActionController::API
    # POST /api/users
    def create
      user = User.new(user_params)
      user.is_active = true

      if user.save
        render json: {
          id:           user.id,
          email:        user.email,
          first_name:   user.first_name,
          last_name:    user.last_name,
          role:         user.role,
          organization: user.organization,
          created_at:   user.created_at
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def user_params
      params.require(:user).permit(
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
