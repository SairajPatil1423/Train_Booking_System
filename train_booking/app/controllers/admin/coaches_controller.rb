class Admin::CoachesController < Admin::BaseController
  def index
    result = Admin::Coach::Operation::Index.run(params: merged_params(paginated_params))
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
end
