# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if current_user
      token = request.env['warden-jwt_auth.token']
      render json: { message: 'Logged in successfully.', data: resource, token: token }, status: :ok
    else
      render json: { message: 'Invalid credentials.' }, status: :unauthorized
    end
  end

  def respond_to_on_destroy(*)
    if request.headers['Authorization'].present?
      render json: { message: 'Logged out successfully.' }, status: :ok
    else
      render json: { message: 'No active session.' }, status: :unauthorized
    end
  end
end
