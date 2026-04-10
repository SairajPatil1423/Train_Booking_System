class Admin::FareRulesController < Admin::BaseController
  def index
    if search_requested?
      result = Admin::FareRule::Operation::Search.run(params: merged_params(search_params))
    else
      result = Admin::FareRule::Operation::Index.run(params: merged_params(paginated_params))
    end
    render_result(result)
  end

  def create
    authorize FareRule

    result = Admin::FareRule::Operation::Create.run(params: merged_params(fare_rule_params))
    render_result(result)
  end

  def update
    result = Admin::FareRule::Operation::Update.run(params: merged_params(fare_rule_params).merge(id: params[:id]))
    render_result(result)
  end

  def destroy
    result = Admin::FareRule::Operation::Destroy.run(params: merged_params(id_params))
    render_result(result)
  end

  private

  def fare_rule_params
    permitted_resource_params(
      :fare_rule,
      :train_id,
      :coach_type,
      :base_fare_per_km,
      :dynamic_multiplier,
      :valid_from,
      :valid_to
    )
  end

  def search_params
    params.permit(:page, :per_page, :train_name, :train_number).to_h.symbolize_keys
  end

  def search_requested?
    params[:train_name].present? || params[:train_number].present?
  end
end
