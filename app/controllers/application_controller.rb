class ApplicationController < ActionController::API
  include Pundit   
  def current_user
    return nil unless request.headers["Authorization"]

    token = request.headers["Authorization"].split(" ").last

    begin
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      @current_user ||= User.find(decoded["user_id"])
    rescue
      nil
    end
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def user_not_authorized
    render json: { error: "You are not authorized" }, status: :forbidden
  end
end