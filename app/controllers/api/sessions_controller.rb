# app/controllers/api/sessions_controller.rb
module Api
  class SessionsController < ActionController::API
    # POST /api/users/login
    #   body: { email: "...", password: "..." }
    def create
      user = User.find_by(email: params[:email])

      if user&.authenticate(params[:password])
        token = jwt_encode(user_id: user.id)

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
          },
          token: token
        }
      else
        render json: { error: "Invalid email or password" },
               status: :unauthorized
      end
    end

    # GET /api/users/profile
    #   Header: Authorization: Bearer <token>
    def profile
      token   = request.headers['Authorization']&.split(' ')&.last
      payload = jwt_decode(token)
      user    = User.find_by(id: payload['user_id'])

      if user
        render json: {
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
      else
        render json: { error: "User not found" },
               status: :unauthorized
      end
    rescue JWT::DecodeError
      render json: { error: "Invalid token" }, status: :unauthorized
    end

    private

    # Issue a JWT that expires in 24h
    def jwt_encode(payload, exp = 24.hours.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, Rails.application.secret_key_base)
    end

    # Decode and return the payload
    def jwt_decode(token)
      decoded, = JWT.decode(token, Rails.application.secret_key_base)
      decoded
    end
  end
end
