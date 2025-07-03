# config/routes.rb

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # simplified lesson_planning route
    get "lesson_planning", to: "lesson_planning#index"

    resources :lessons, only: [:create, :show] do
      get :random, on: :collection
    end

    resources :lesson_parts, only: [:create]
  end

  root "application#index"
  get "*path", to: "application#index",
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
