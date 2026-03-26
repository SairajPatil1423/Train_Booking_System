module Api
  module V1
    class StationsController < ApplicationController

      before_action :authenticate_user!

      def index
        render json: Station.all
      end

      def create
        authorize Station

        station = Station.new(station_params)

        if station.save
          render json: station, status: :created
        else
          render json: { errors: station.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def station_params
        params.require(:station).permit(:name, :code, :city_id, :latitude, :longitude)
      end

    end
  end
end