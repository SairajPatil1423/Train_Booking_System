class Admin::CoachesController < Admin::BaseController
  before_action :set_coach, only: %i[update destroy]

  def index
    authorize Coach
    coaches_scope = Coach.includes(:train, :seats).order(:train_id, :coach_number)

    if pagination_requested?
      total_count = coaches_scope.count
      page = normalized_page
      per_page = normalized_per_page
      total_pages = [(total_count.to_f / per_page).ceil, 1].max
      page = [page, total_pages].min
      offset = (page - 1) * per_page
      coaches = coaches_scope.offset(offset).limit(per_page)

      render json: {
        coaches: coaches.map { |coach| serialize_coach(coach) },
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }, status: :ok
      return
    end

    render json: {
      coaches: coaches_scope.map { |coach| serialize_coach(coach) }
    }, status: :ok
  end

  def create
    authorize Coach
    result = Admin::Coach::Operation::Create.call(
      current_user: current_user,
      params: coach_params
    )
    if result.success?
      render json: {
        message: 'Coach created with seats',
        coach: serialize_coach(result[:model])
      }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    authorize @coach
    result = Admin::Coach::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: coach_params
    )
    if result.success?
      render json: { message: 'Coach updated', coach: serialize_coach(result[:model]) }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @coach
    result = Admin::Coach::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )
    if result.success?
      render json: { message: 'Coach deleted' }, status: :ok
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

  def set_coach
    @coach = Coach.find(params[:id])
  end

  def coach_params
    params.require(:coach).permit(:train_id, :coach_number, :coach_type)
  end

  def serialize_coach(coach)
    coach.as_json(
      only: %i[id train_id coach_number total_seats],
      include: {
        train: { only: %i[id train_number name] },
        seats: { only: %i[id seat_number seat_type is_active] }
      }
    ).merge(coach_type: coach.api_coach_type)
  end
end
