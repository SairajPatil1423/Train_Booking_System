class Admin::TrainStopsController < Admin::BaseController
  before_action :set_train_stop, only: %i[update destroy]

  def index
    authorize TrainStop
    stops = TrainStop.includes(:train, :station).order(:train_id, :stop_order)
    render json: { train_stops: stops.map { |stop| serialize_train_stop(stop) } }, status: :ok
  end

  def create
    authorize TrainStop
    result = Admin::TrainStop::Operation::Create.call(
      current_user: current_user,
      params: train_stop_params
    )

    if result.success?
      render json: { message: 'Train stop added successfully', train_stop: serialize_train_stop(result[:model]) }, status: :created
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
      render json: { message: 'Train stop updated successfully', train_stop: serialize_train_stop(result[:model]) }, status: :ok
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
      :arrival_time, :departure_time, :arrival_at, :departure_at, :distance_from_origin_km
    )
  end

  def serialize_train_stop(train_stop)
    train_stop.as_json(include: {
      train: { only: %i[id train_number name train_type] },
      station: {
        only: %i[id name code],
        include: {
          city: { only: %i[id name state country] }
        }
      }
    }).merge(
      arrival_at: train_stop.arrival_at,
      departure_at: train_stop.departure_at
    )
  end
end
