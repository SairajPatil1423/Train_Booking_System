class ApplicationController < ActionController::API

  def current_user
    return nil unless request.headers["Authorization"]

    token = request.headers["Authorization"].split(" ").last

    begin
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      @current_user ||= User.find(decoded["user_id"])
    rescue JWT::DecodeError
      nil
    end
  end

  def authenticate_user!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

end