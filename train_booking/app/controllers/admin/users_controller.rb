class Admin::UsersController < Admin::BaseController
  def create
    authorize User, :create_admin?

    result = Admin::User::Operation::Create.run(params: merged_params(user_params))
    render_result(result)
  end

  private

  def user_params
    permitted_resource_params(
      :user,
      :email,
      :password,
      :password_confirmation,
      :phone,
      :full_name,
      :username,
      :address
    )
  end
end
