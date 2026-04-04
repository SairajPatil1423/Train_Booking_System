class Admin::FareRulesController < Admin::BaseController
  def index
    authorize FareRule
    fare_rules_scope = FareRule.includes(:train).order(valid_from: :desc)

    if pagination_requested?
      total_count = fare_rules_scope.count
      page = normalized_page
      per_page = normalized_per_page
      total_pages = [(total_count.to_f / per_page).ceil, 1].max
      page = [page, total_pages].min
      offset = (page - 1) * per_page
      fare_rules = fare_rules_scope.offset(offset).limit(per_page)

      render json: {
        fare_rules: fare_rules.as_json(include: :train),
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }, status: :ok
      return
    end

    render json: { fare_rules: fare_rules_scope.as_json(include: :train) }, status: :ok
  end

  def create
    authorize FareRule

    result = Admin::FareRule::Operation::Create.call(
      current_user: current_user,
      params: fare_rule_params
    )

    if result.success?
      render json: { message: 'Fare rule created successfully', fare_rule: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    fare_rule = FareRule.find(params[:id])
    authorize fare_rule

    result = Admin::FareRule::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: fare_rule_params
    )

    if result.success?
      render json: { message: 'Fare rule updated successfully', fare_rule: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    fare_rule = FareRule.find(params[:id])
    authorize fare_rule

    result = Admin::FareRule::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )

    if result.success?
      render json: { message: 'Fare rule deleted successfully' }, status: :ok
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

  def fare_rule_params
    params.require(:fare_rule).permit(:train_id, :coach_type, :base_fare_per_km, :dynamic_multiplier, :valid_from, :valid_to)
  end
end
