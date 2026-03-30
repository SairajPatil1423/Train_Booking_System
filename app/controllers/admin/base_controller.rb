class Admin::BaseController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  private

  def authorize_admin!
    unless current_user&.admin?
      render json: { error: 'Forbidden', message: 'You must be an administrator to access this endpoint.' }, status: :forbidden
    end
  end
end
