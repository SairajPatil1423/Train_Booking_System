class Admin::SeatsController < Admin::BaseController
  before_action :set_coach
  before_action :set_seat, only: %i[update destroy]

  def index
    authorize Seat
    render json: { seats: @coach.seats.order(:seat_number) }, status: :ok
  end

  def create
    authorize Seat
    render json: { errors: ['Manual seat creation is disabled. Seats are generated from coach_type layout.'] }, status: :unprocessable_entity
  end

  def update
    authorize @seat
    render json: { errors: ['Manual seat updates are disabled. Change the coach layout instead.'] }, status: :unprocessable_entity
  end

  def destroy
    authorize @seat
    render json: { errors: ['Manual seat deletion is disabled. Seats are controlled by coach layout.'] }, status: :unprocessable_entity
  end

  private

  def set_coach
    @coach = Coach.find(params[:coach_id])
  end

  def set_seat
    @seat = @coach.seats.find(params[:id])
  end
end
