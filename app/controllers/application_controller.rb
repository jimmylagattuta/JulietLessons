class ApplicationController < ActionController::API
    def index
        path = Rails.root.join('public', 'index.html')
        if File.exist?(path)
        response.headers['Content-Type'] = 'text/html; charset=utf-8'
        render plain: File.read(path), content_type: 'text/html'
        else
        render plain: 'SPA index.html missing. Check Heroku postbuild.', status: :internal_server_error
        end
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
