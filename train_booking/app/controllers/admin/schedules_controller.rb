class Admin::SchedulesController < Admin::BaseController
  def index
    result = Admin::Schedule::Operation::Index.run(params: merged_params(paginated_params))
    render_result(result)
  end

  def create
    result = Admin::Schedule::Operation::Create.run(params: merged_params(schedule_create_params))
    render_result(result)
  end

  def update
    result = Admin::Schedule::Operation::Update.run(params: merged_params(schedule_update_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::Schedule::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def schedule_create_params
    permitted_resource_params(
      :schedule,
      :train_id,
      :travel_date,
      :departure_time,
      :expected_arrival_time,
      :status,
      :delay_minutes
    )
  end

  def schedule_update_params
    permitted_resource_params(:schedule, :departure_time, :expected_arrival_time, :status, :delay_minutes)
  end
end
