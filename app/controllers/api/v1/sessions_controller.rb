module Api
  module V1
    class SessionsController < ApplicationController

      def create
        user = User.find_by(email: params[:email])

        if user && user.valid_password?(params[:password])
          token = generate_jwt(user)

          render json: {
            message: "Logged in successfully",
            token: token,
            user: user
          }, status: :ok
        else
          render json: {
            error: "Invalid email or password"
          }, status: :unauthorized
        end
      end

      private

      def generate_jwt(user)
        payload = {
          user_id: user.id,
          exp: 24.hours.from_now.to_i
        }

        JWT.encode(payload, Rails.application.credentials.secret_key_base)
      end
    end
  end
end