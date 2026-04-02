class Admin::CoachesController < Admin::BaseController
  before_action :set_coach, only: %i[update destroy]

  def index
    authorize Coach
    coaches = Coach.includes(:train, :seats).order(:train_id, :coach_number)
    render json: {
      coaches: coaches.map { |coach| serialize_coach(coach) }
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

  def seats_index
    authorize Seat
    coach = Coach.find(params[:coach_id])
    render json: { seats: coach.seats.order(:seat_number) }, status: :ok
  end

  private

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
