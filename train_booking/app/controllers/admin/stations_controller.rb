class Admin::StationsController < Admin::BaseController
  def index
    result = Admin::Station::Operation::Index.run(params: merged_params(paginated_params))
    render_result(result)
  end

  def create
    authorize Station

    result = Admin::Station::Operation::Create.run(params: merged_params(station_params))
    render_result(result)
  end

  def update
    result = Admin::Station::Operation::Update.run(params: merged_params(station_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::Station::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def station_params
    permitted_resource_params(
      :station,
      :city_id,
      :city_name,
      :city_state,
      :city_country,
      :name,
      :code,
      :latitude,
      :longitude
    )
  end
end
