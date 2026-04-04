class Admin::TrainsController < Admin::BaseController
  def index
    authorize Train
    trains_scope = Train.order(:train_number)
    trains = paginate_scope(trains_scope)

    render json: paginated_response(data: trains, records: trains), status: :ok
  end

  def create
    authorize Train

    result = Admin::Train::Operation::Create.call(
      current_user: current_user,
      params: train_params
    )

    if result.success?
      render json: { message: 'Train created successfully', train: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    train = Train.find(params[:id])
    authorize train

    result = Admin::Train::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: train_params
    )

    if result.success?
      render json: { message: 'Train updated successfully', train: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    train = Train.find(params[:id])
    authorize train

    result = Admin::Train::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )

    if result.success?
      render json: { message: 'Train deleted successfully' }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def train_params
    params.require(:train).permit(:train_number, :name, :train_type, :rating, :grade, :is_active)
  end
end
