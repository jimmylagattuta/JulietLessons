Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # Lesson-planning stub
    get  "lesson_planning", to: "lesson_planning#index"

    # Lessons
    resources :lessons, only: [:create, :show] do
      get :random, on: :collection
    end

    # Lesson parts
    resources :lesson_parts, only: [:create]

    # ---- Auth endpoints ----
    post 'users/register', to: 'users#create'
    post 'users/login',    to: 'sessions#create'
    get  'users/profile',  to: 'sessions#profile'
  end

  # All other paths fall back to your front-end
  root "application#index"
  get "*path", to: "application#index",
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
