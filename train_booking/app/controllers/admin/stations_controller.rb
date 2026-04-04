class Admin::StationsController < Admin::BaseController
  def index
    authorize Station
    stations_scope = Station.includes(:city).order(:name)
    stations = paginate_scope(stations_scope)

    render json: paginated_response(
      data: stations.as_json(include: :city),
      records: stations
    ), status: :ok
  end

  def create
    authorize Station

    result = Admin::Station::Operation::Create.call(
      current_user: current_user,
      params: station_params
    )

    if result.success?
      render json: { message: 'Station created successfully', station: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    station = Station.find(params[:id])
    authorize station

    result = Admin::Station::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: station_params
    )

    if result.success?
      render json: { message: 'Station updated successfully', station: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    station = Station.find(params[:id])
    authorize station

    result = Admin::Station::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )

    if result.success?
      render json: { message: 'Station deleted successfully' }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def station_params
    params.require(:station).permit(:city_id, :city_name, :city_state, :city_country, :name, :code, :latitude, :longitude)
  end
end
