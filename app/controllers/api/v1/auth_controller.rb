module Api
  module V1
    class AuthController < ApplicationController

      def signup
        user = User.new(user_params)

        if user.save
          render json: {
            message: "User created successfully",
            user: user
          }, status: :created
        else
          render json: {
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end


      def create_admin
        return render json: { error: "Not allowed" }, status: :forbidden unless params[:secret] == "admin123"

        user = User.new(
          email: params[:email],
          password: params[:password],
          phone: params[:phone],
          role: "admin"
        )

        if user.save
          render json: {
            message: "Admin created",
            user: user
          }, status: :created
        else
          render json: {
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end


      private

      def user_params
        params.require(:user).permit(
          :email,
          :password,
          :phone
        )
      end
      
    end
  end
end