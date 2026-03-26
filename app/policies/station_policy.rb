class StationPolicy < ApplicationPolicy

  def create?
    user.admin?
  end

  def index?
    true
  end

end