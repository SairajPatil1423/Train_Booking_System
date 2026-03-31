class Admin::TrainStopsController < Admin::BaseController
  before_action :set_train_stop, only: %i[update destroy]

  def index
    authorize TrainStop
    stops = TrainStop.includes(:train, :station).order(:train_id, :stop_order)
    render json: { train_stops: stops.as_json(include: [:train, :station]) }, status: :ok
  end

  def create
    authorize TrainStop
    result = Admin::TrainStop::Operation::Create.call(
      current_user: current_user,
      params: train_stop_params
    )

    if result.success?
      render json: { message: 'Train stop added successfully', train_stop: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    authorize @train_stop
    result = Admin::TrainStop::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: train_stop_params
    )

    if result.success?
      render json: { message: 'Train stop updated successfully', train_stop: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @train_stop
    result = Admin::TrainStop::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )

    if result.success?
      render json: { message: 'Train stop removed successfully' }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def set_train_stop
    @train_stop = TrainStop.find(params[:id])
  end

  def train_stop_params
    params.require(:train_stop).permit(
      :train_id, :station_id, :stop_order,
      :arrival_time, :departure_time, :distance_from_origin_km
    )
  end
end
