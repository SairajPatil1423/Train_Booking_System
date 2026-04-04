class Admin::TrainsController < Admin::BaseController
  def index
    authorize Train
    trains_scope = Train.order(:train_number)

    if pagination_requested?
      total_count = trains_scope.count
      page = normalized_page
      per_page = normalized_per_page
      total_pages = [(total_count.to_f / per_page).ceil, 1].max
      page = [page, total_pages].min
      offset = (page - 1) * per_page
      trains = trains_scope.offset(offset).limit(per_page)

      render json: {
        trains: trains,
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }, status: :ok
      return
    end

    render json: { trains: trains_scope }, status: :ok
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

  def pagination_requested?
    params[:page].present? || params[:per_page].present?
  end

  def normalized_page
    [params[:page].to_i, 1].max
  end

  def normalized_per_page
    requested = params[:per_page].to_i
    requested = 10 if requested <= 0
    [requested, 50].min
  end

  def train_params
    params.require(:train).permit(:train_number, :name, :train_type, :rating, :grade, :is_active)
  end
end
