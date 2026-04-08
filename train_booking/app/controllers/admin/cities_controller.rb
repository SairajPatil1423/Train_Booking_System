class Admin::CitiesController < Admin::BaseController
  def index
    result = Admin::City::Operation::Index.run(params: merged_params(paginated_params))
    render_result(result)
  end

  def create
    result = Admin::City::Operation::Create.run(params: merged_params(city_params))
    render_result(result)
  end

  def update
    result = Admin::City::Operation::Update.run(params: merged_params(city_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::City::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def city_params
    permitted_resource_params(:city, :name, :state, :country)
  end
end
