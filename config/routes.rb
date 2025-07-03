Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :lessons, only: [:create, :show] do
      get :random, on: :collection
    end

    resources :lesson_parts, only: [:create]  # ← ✅ Add this line
  end

  root 'application#index'
  get '*path', to: 'application#index',
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
