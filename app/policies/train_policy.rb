class TrainPolicy < ApplicationPolicy
  class Scope
    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user.role == "admin"
        scope.all
      else
        scope.none
      end
    end

    private

    attr_reader :user, :scope
  end

  def create?
    user.role == "admin"
  end

  def update?
    user.role == "admin" or not record.published?
  end
end