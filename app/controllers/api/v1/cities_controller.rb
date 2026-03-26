module Api
  module V1
    class CitiesController < ApplicationController

      before_action :authenticate_user!

      def index
        render json: City.all
      end

      def show
        city = City.find(params[:id])
        render json: city
      end

      def create
        authorize City

        city = City.new(city_params)

        if city.save
          render json: city, status: :created
        else
          render json: { errors: city.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def city_params
        params.require(:city).permit(:name, :state, :country)
      end

    end
  end
end