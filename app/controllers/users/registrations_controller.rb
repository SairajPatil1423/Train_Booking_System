# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :phone)
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      token = request.env['warden-jwt_auth.token']
      render json: { message: "Signed up successfully.", user: user_payload(resource), token: token }, status: :created
    else
      render json: { error: resource.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def user_payload(user)
    user.as_json(only: %i[id email phone role created_at updated_at])
  end
end
