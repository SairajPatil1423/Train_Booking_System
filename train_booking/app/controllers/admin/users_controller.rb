class Admin::UsersController < Admin::BaseController
  def create
    authorize User, :create_admin?

    result = Admin::User::Operation::Create.call(
      current_user: current_user,
      params: user_params
    )

    if result.success?
      user_json = result[:model].as_json(only: %i[id email phone full_name username address role created_at updated_at])
      render json: { message: 'Administrator created successfully', admin: user_json }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :phone)
  end
end
