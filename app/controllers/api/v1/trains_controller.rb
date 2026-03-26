module Api
  module V1
    class TrainsController < ApplicationController

      before_action :authenticate_user!

      def index
        trains = Train.all
        render json: trains
      end

      def show
        train = Train.find(params[:id])
        render json: train
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

      private

      def train_params
        params.permit(:train_number, :name, :train_type, :is_active)
      end

    end
  end
end