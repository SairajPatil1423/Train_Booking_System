class Admin::TrainsController < Admin::BaseController
  def index
    if search_requested?
      result = Admin::Train::Operation::Search.run(params: merged_params(search_params))
    else
      result = Admin::Train::Operation::Index.run(params: merged_params(paginated_params))
    end
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

  def search_params
    params.permit(:page, :per_page, :train_name, :train_number).to_h.symbolize_keys
  end

  def search_requested?
    params[:train_name].present? || params[:train_number].present?
  end
end
