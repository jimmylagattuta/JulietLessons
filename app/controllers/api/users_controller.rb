# app/controllers/api/users_controller.rb
module Api
  class UsersController < ActionController::API
    # POST /api/users/register
    def create
      user           = User.new(user_params)
      user.is_active = true

      if user.save
        render json: {
          user: {
            id:           user.id,
            email:        user.email,
            firstName:    user.first_name,
            lastName:     user.last_name,
            role:         user.role,
            organization: user.organization,
            isActive:     user.is_active,
            lastLoginAt:  user.last_login_at,
            createdAt:    user.created_at,
            updatedAt:    user.updated_at
          }
        }, status: :created
      else
        render json: { error: user.errors.full_messages.join(", ") },
               status: :unprocessable_entity
      end
    end

    private

    # Permit the incoming camelCase params and map to snake_case
    def user_params
      raw = params.permit(
        :email,
        :password,
        :firstName,
        :lastName,
        :role,
        :organization
      ).to_h

      {
        email:        raw["email"],
        password:     raw["password"],
        first_name:   raw["firstName"],
        last_name:    raw["lastName"],
        role:         raw["role"],
        organization: raw["organization"]
      }
    end
  end
end
