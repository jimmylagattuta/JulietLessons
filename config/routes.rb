# config/routes.rb

Rails.application.routes.draw do
  namespace :api do
    get "users/create"
  end
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # Lesson-planning stub
    get "lesson_planning", to: "lesson_planning#index"

    resources :lessons, only: [:create, :show] do
      get :random, on: :collection
    end

    resources :lesson_parts, only: [:create]
    resources :users,        only: [:create]   # ← sign-up endpoint
  end

  root "application#index"
  get "*path", to: "application#index",
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
