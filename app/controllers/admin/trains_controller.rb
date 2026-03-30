class Admin::TrainsController < Admin::BaseController
  def index

    @trains = Train.all.order(:train_number)
    render json: { trains: @trains }, status: :ok
  end

  def create
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
    params.require(:train).permit(:train_number, :name, :train_type, :is_active)
  end
end
