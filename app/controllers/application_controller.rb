class ApplicationController < ActionController::API
  include Pundit::Authorization

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  rescue_from StandardError, with: :internal_server_error

  private

  def not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end

  def user_not_authorized(_exception)
    render json: { error: "You are not authorized to perform this action." }, status: :forbidden
  end

  def internal_server_error(exception)
    Rails.logger.error(exception.message)
    Rails.logger.error(exception.backtrace.join("\n"))

    message = Rails.env.production? ? "Internal Server Error" : exception.message
    render json: { error: message }, status: :internal_server_error
  end
end
