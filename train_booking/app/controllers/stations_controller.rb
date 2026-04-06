# StationsController provides station search data for the user flow.
class StationsController < ApplicationController
  def index
    authorize Station, :search?

    stations_scope = Station.includes(:city).order(:name)
    stations = paginate_scope(stations_scope)

    render json: paginated_response(
      data: stations.as_json(
        only: %i[id name code],
        include: {
          city: {
            only: %i[id name state country]
          }
        }
      ),
      records: stations
    ), status: :ok
  end
end
