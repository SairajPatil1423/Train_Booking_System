class UserPolicy < ApplicationPolicy
  def create_admin?
    user&.admin?
  end
end
