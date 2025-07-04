class ApplicationController < ActionController::API
    def index
        render file: Rails.root.join('public', 'index.html')
    end
    
    def authenticate_admin!
        token = request.headers['Authorization']&.split(' ')&.last
        payload = JWT.decode(token, Rails.application.secret_key_base)[0]
        user = User.find(payload['user_id'])

        unless user.role == 'admin'
        render json: { error: 'Unauthorized' }, status: :unauthorized
        end
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { error: 'Invalid token or user' }, status: :unauthorized
    end
end
