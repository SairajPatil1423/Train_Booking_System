# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      token = request.env['warden-jwt_auth.token']
      render json: { message: 'Signed up successfully.', data: resource, token: token }, status: :created
    else
      render json: { message: "User couldn't be created successfully.", errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
