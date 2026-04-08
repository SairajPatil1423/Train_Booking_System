class Admin::TrainsController < Admin::BaseController
  def index
    result = Admin::Train::Operation::Index.run(params: merged_params(paginated_params))
    render_result(result)
  end

  def create
    result = Admin::Train::Operation::Create.run(params: merged_params(train_params))
    render_result(result)
  end

  def update
    result = Admin::Train::Operation::Update.run(params: merged_params(train_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::Train::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def train_params
    permitted_resource_params(:train, :train_number, :name, :train_type, :rating, :grade, :is_active)
  end
end
