class Admin::SeatsController < Admin::BaseController
  before_action :set_coach
  before_action :set_seat, only: %i[update destroy]

  def index
    authorize Seat
    render json: { seats: @coach.seats.order(:seat_number) }, status: :ok
  end

  def create
    authorize Seat
    seat = @coach.seats.create!(
      seat_number: seat_params[:seat_number],
      seat_type: seat_params[:seat_type] || 'seat',
      is_active: true
    )
    render json: { message: 'Seat added', seat: seat }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def update
    authorize @seat
    @seat.update!(seat_params)
    render json: { message: 'Seat updated', seat: @seat }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def destroy
    authorize @seat
    if TicketAllocation.where(seat_id: @seat.id).where.not(status: 'cancelled').exists?
      render json: { errors: ['Cannot delete seat with active allocations'] }, status: :unprocessable_entity
    else
      @seat.destroy!
      render json: { message: 'Seat removed' }, status: :ok
    end
  end

  private

  def set_coach
    @coach = Coach.find(params[:coach_id])
  end

  def set_seat
    @seat = @coach.seats.find(params[:id])
  end

  def seat_params
    params.require(:seat).permit(:seat_number, :seat_type, :is_active)
  end
end
