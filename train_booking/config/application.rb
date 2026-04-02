require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"

Bundler.require(*Rails.groups)

module TrainBooking
  class Application < Rails::Application
    config.load_defaults 7.1

    config.autoload_lib(ignore: %w(assets tasks))
    config.api_only = true
    config.time_zone = "Asia/Kolkata"
    config.active_record.default_timezone = :utc

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end
  end
end
