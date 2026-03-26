module Api
  module V1
    class TrainsController < ApplicationController

      before_action :authenticate_user!
      before_action :set_train, only: [:show, :update, :destroy]

      def index
        trains = Train.all
        render json: trains
      end

      def show
        render json: @train
      end

      def create
        authorize Train

        train = Train.new(train_params)

        if train.save
          render json: train, status: :created
        else
          render json: { errors: train.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @train

        if @train.update(train_params)
          render json: @train
        else
          render json: { errors: @train.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @train

        @train.destroy
        render json: { message: "Train deleted successfully" }
      end

      def search_by_name
        from = params[:from]
        to   = params[:to]

        
        source_stations = Station.joins(:city)
          .where("stations.name ILIKE ? OR cities.name ILIKE ?", "%#{from}%", "%#{from}%")

        
        dest_stations = Station.joins(:city)
          .where("stations.name ILIKE ? OR cities.name ILIKE ?", "%#{to}%", "%#{to}%")

        source_ids = source_stations.pluck(:id)
        dest_ids   = dest_stations.pluck(:id)

        
        trains = Train.joins(:train_stops)
                      .where(train_stops: { station_id: source_ids + dest_ids })
                      .group("trains.id")
                      .having("COUNT(DISTINCT train_stops.station_id) >= 2")

       
        valid_trains = trains.select do |train|
          stops = train.train_stops.where(station_id: source_ids + dest_ids)

          source_stop = stops.select { |s| source_ids.include?(s.station_id) }.min_by(&:stop_order)
          dest_stop   = stops.select { |s| dest_ids.include?(s.station_id) }.max_by(&:stop_order)

          source_stop && dest_stop && source_stop.stop_order < dest_stop.stop_order
        end

        render json: valid_trains
      end

      private

      def set_train
        @train = Train.find(params[:id])
      end

      def train_params
        params.require(:train).permit(
          :train_number,
          :name,
          :train_type,
          :is_active
        )
      end

    end
  end
end