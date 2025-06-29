Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    get 'lessons/random', to: 'lessons#random'
  end

  root 'application#index'
  get '*path', to: 'application#index', constraints: ->(req) { !req.xhr? && req.format.html? }

  # Defines the root path route ("/")
  # root "posts#index"
end