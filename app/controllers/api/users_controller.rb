# app/controllers/api/users_controller.rb
module Api
  class UsersController < ApplicationController
    before_action :authenticate_admin!, only: [:stats]

    def index
      users = User.all.map do |user|
        {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          organization: user.organization,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        }
      end

      render json: users
    end

    # POST /api/users/register
    def create
      raw = user_params_raw

      if User.exists?(email: raw["email"])
        return render json: { error: "Email already taken" }, status: :conflict
      end

      user = User.new(user_params)
      user.is_active = true

      if user.save
        token = JWT.encode(
          { user_id: user.id, exp: 24.hours.from_now.to_i },
          Rails.application.secret_key_base
        )

        render json: { user: user_response(user), token: token }, status: :created
      else
        render json: { error: user.errors.full_messages.join(", ") },
               status: :unprocessable_entity
      end
    end

    def show
      user = User.find(params[:id])
      render json: user_response(user)
    rescue ActiveRecord::RecordNotFound
      render json: { error: "User not found" }, status: :not_found
    end


    # GET /api/users/stats (admin only)
    def stats
      now               = Time.current
      start_of_month    = now.beginning_of_month
      total_users       = User.count
      active_users      = User.where(is_active: true).count
      teacher_count     = User.where(role: 'teacher').count
      admin_count       = User.where(role: 'admin').count
      student_count     = User.where(role: 'student').count
      new_users_this_month = User.where('created_at >= ?', start_of_month).count
      subscribed_users  = Subscription.where(status: 'active').count
      total_revenue     = Subscription.sum(:total_spent_on_lessons).to_f

      render json: {
        totalUsers:        total_users,
        activeUsers:       active_users,
        teacherCount:      teacher_count,
        adminCount:        admin_count,
        studentCount:      student_count,
        newUsersThisMonth: new_users_this_month,
        subscribedUsers:   subscribed_users,
        totalRevenue:      total_revenue
      }
    rescue => e
      Rails.logger.error("Error fetching user stats: #{e.message}")
      render json: { error: 'Failed to fetch user statistics' }, status: :internal_server_error
    end

    private

    def user_params_raw
      params.permit(:email, :password, :firstName, :lastName, :role, :organization).to_h
    end

    def user_params
      raw = user_params_raw
      {
        email:        raw["email"],
        password:     raw["password"],
        first_name:   raw["firstName"],
        last_name:    raw["lastName"],
        role:         raw["role"],
        organization: raw["organization"]
      }
    end

    def user_response(user)
      {
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
    end
  end
end
