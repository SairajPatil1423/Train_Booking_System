class Admin::CoachesController < Admin::BaseController
  def index
    if search_requested?
      result = Admin::Coach::Operation::Search.run(params: merged_params(search_params))
    else
      result = Admin::Coach::Operation::Index.run(params: merged_params(paginated_params))
    end
    render_result(result)
  end

  def create
    authorize Coach
    result = Admin::Coach::Operation::Create.run(params: merged_params(coach_params))
    render_result(result)
  end

  def update
    result = Admin::Coach::Operation::Update.run(params: merged_params(coach_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::Coach::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def coach_params
    permitted_resource_params(:coach, :train_id, :coach_number, :coach_type)
  end

  def search_params
    params.permit(:page, :per_page, :train_name, :train_number, :coach_type).to_h.symbolize_keys
  end

  def search_requested?
    params[:train_name].present? || params[:train_number].present? || params[:coach_type].present?
  end
end
