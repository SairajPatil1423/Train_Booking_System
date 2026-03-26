module Api
  module V1
    class TrainStopsController < ApplicationController

      before_action :authenticate_user!

      def index
        stops = TrainStop.where(train_id: params[:train_id]).order(:stop_order)
        render json: stops
      end

      def create
        authorize TrainStop

        stop = TrainStop.new(train_stop_params)

        if stop.save
          render json: stop, status: :created
        else
          render json: { errors: stop.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def train_stop_params
        params.require(:train_stop).permit(
          :train_id,
          :station_id,
          :stop_order,
          :arrival_time,
          :departure_time,
          :distance_from_origin_km
        )
      end

    end
  end
end