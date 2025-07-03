# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins [
      'http://localhost:3000',
      'https://juliet-lessons-e75b65ff418d.herokuapp.com'
    ]

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
