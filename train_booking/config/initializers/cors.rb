frontend_origin_list = ENV.fetch("FRONTEND_ORIGINS", "")
  .split(",")
  .map(&:strip)
  .reject(&:empty?)

development_origins = [
  %r{\Ahttp://localhost:\d+\z},
  %r{\Ahttps://localhost:\d+\z},
  %r{\Ahttp://127\.0\.0\.1:\d+\z},
  %r{\Ahttps://127\.0\.0\.1:\d+\z},
  %r{\Ahttp://\[::1\]:\d+\z},
  %r{\Ahttps://\[::1\]:\d+\z},
]

allowed_origins =
  if Rails.env.development?
    frontend_origin_list + development_origins
  else
    frontend_origin_list
  end

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: %w[Authorization],
      max_age: 600,
      credentials: true
  end
end
