class Admin::FareRulesController < Admin::BaseController
  def index
    authorize FareRule
    fare_rules = FareRule.includes(:train).order(valid_from: :desc)
    render json: { fare_rules: fare_rules.as_json(include: :train) }, status: :ok
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

  def fare_rule_params
    params.require(:fare_rule).permit(:train_id, :coach_type, :base_fare_per_km, :dynamic_multiplier, :valid_from, :valid_to)
  end
end
