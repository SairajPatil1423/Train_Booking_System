class BookingPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    user&.admin? || record.user_id == user&.id
  end

  def create?
    user.present?
  end

  def update?
    cancel?
  end

  def cancel?
    user&.admin? || record.user_id == user&.id
  end

  class Scope < Scope
    def resolve
      return scope.none unless user
      return scope.all if user.admin?

      scope.where(user_id: user.id)
    end
  end
end
