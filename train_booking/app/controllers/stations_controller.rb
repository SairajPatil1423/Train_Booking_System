class StationsController < ApplicationController
  def index
    authorize Station, :search?

    stations = Station.includes(:city).order(:name)

    render json: {
      stations: stations.as_json(
        only: %i[id name code],
        include: {
          city: {
            only: %i[id name state country]
          }
        }
      )
    }, status: :ok
  end
end
