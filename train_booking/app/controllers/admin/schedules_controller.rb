class Admin::SchedulesController < Admin::BaseController
  before_action :set_schedule, only: %i[update destroy]

  def index
    authorize Schedule
    schedules_scope = Schedule.includes(:train).order(travel_date: :asc)

    if pagination_requested?
      total_count = schedules_scope.count
      page = normalized_page
      per_page = normalized_per_page
      total_pages = [(total_count.to_f / per_page).ceil, 1].max
      page = [page, total_pages].min
      offset = (page - 1) * per_page
      schedules = schedules_scope.offset(offset).limit(per_page)

      render json: {
        schedules: schedules.as_json(include: { train: { only: %i[id train_number name train_type] } }),
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }, status: :ok
      return
    end

    render json: { schedules: schedules_scope.as_json(include: { train: { only: %i[id train_number name train_type] } }) }, status: :ok
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
