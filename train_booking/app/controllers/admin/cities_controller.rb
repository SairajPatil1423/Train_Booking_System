class Admin::CitiesController < Admin::BaseController
  before_action :set_city, only: %i[update destroy]

  def index
    authorize City
    cities = City.order(:country, :state, :name)
    render json: { cities: cities }, status: :ok
  end

  def create
    authorize City
    result = Admin::City::Operation::Create.call(
      current_user: current_user,
      params: city_params
    )

    if result.success?
      render json: { message: "City created successfully", city: result[:model] }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def update
    authorize @city
    result = Admin::City::Operation::Update.call(
      current_user: current_user,
      id: params[:id],
      params: city_params
    )

    if result.success?
      render json: { message: "City updated successfully", city: result[:model] }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @city
    result = Admin::City::Operation::Destroy.call(
      current_user: current_user,
      id: params[:id]
    )

    if result.success?
      render json: { message: "City deleted successfully" }, status: :ok
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def set_city
    @city = City.find(params[:id])
  end

  def city_params
    params.require(:city).permit(:name, :state, :country)
  end
end
