# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In production only allow your real front-end
    if Rails.env.production?
      origins ENV.fetch("CORS_ORIGINS", "https://juliet-lessons-e75b65ff418d.herokuapp.com")
    else
      # in dev you can add localhost, ngrok, review apps, etc.
      origins "http://localhost:3000", "https://*.ngrok-free.app"
    end

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: false
  end
end
