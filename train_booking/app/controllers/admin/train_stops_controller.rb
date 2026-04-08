class Admin::TrainStopsController < Admin::BaseController
  def index
    result = Admin::TrainStop::Operation::Index.run(params: merged_params(paginated_params))
    render_result(result)
  end

  def create
    authorize TrainStop
    result = Admin::TrainStop::Operation::Create.run(params: merged_params(train_stop_params))
    render_result(result)
  end

  def update
    result = Admin::TrainStop::Operation::Update.run(params: merged_params(train_stop_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::TrainStop::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def train_stop_params
    permitted_resource_params(
      :train_stop,
      :train_id,
      :station_id,
      :stop_order,
      :arrival_at,
      :arrival_time,
      :departure_at,
      :departure_time,
      :distance_from_origin_km
    )
  end
end
