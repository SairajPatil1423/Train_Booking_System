class Admin::CoachesController < Admin::BaseController
  before_action :set_coach, only: %i[update destroy]

  def index
    authorize Coach
    coaches = Coach.includes(:train, :seats).order(:train_id, :coach_number)
    render json: {
      coaches: coaches.as_json(
        include: {
          train: { only: %i[id train_number name] },
          seats: { only: %i[id seat_number seat_type is_active] }
        }
      )
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
        coach: result[:model].as_json(include: { seats: { only: %i[id seat_number seat_type] } })
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
      render json: { message: 'Coach updated', coach: result[:model] }, status: :ok
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
    params.require(:coach).permit(:train_id, :coach_number, :coach_type, :total_seats, :seat_type)
  end
end
