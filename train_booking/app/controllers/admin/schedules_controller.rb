class Admin::SchedulesController < Admin::BaseController
  before_action :set_schedule, only: %i[update destroy]

  def index
    authorize Schedule
    schedules_scope = Schedule.includes(:train).order(travel_date: :asc)
    schedules = paginate_scope(schedules_scope)

    render json: paginated_response(
      data: schedules.as_json(include: { train: { only: %i[id train_number name train_type] } }),
      records: schedules
    ), status: :ok
  end

  def create
    authorize Schedule
    result = Admin::Schedule::Operation::Create.call(
      current_user: current_user,
      params: schedule_params
    )
    if result.success?
      render json: { message: 'Schedule created', schedule: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    authorize @schedule
    result = Admin::Schedule::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: schedule_params
    )
    if result.success?
      render json: { message: 'Schedule updated', schedule: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @schedule
    result = Admin::Schedule::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )
    if result.success?
      render json: { message: 'Schedule deleted' }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def set_schedule
    @schedule = Schedule.find(params[:id])
  end

  def schedule_params
    params.require(:schedule).permit(
      :train_id, :travel_date, :departure_time,
      :expected_arrival_time, :status, :delay_minutes
    )
  end
end
