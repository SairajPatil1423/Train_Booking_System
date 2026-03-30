class User < ApplicationRecord

  devise :database_authenticatable, :registerable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, { user: 'user', admin: 'admin' }, default: :user

  # Null Revocation Strategy (Stateless / Do nothing on logout payload)
  def self.jwt_revoked?(payload, user)
    false
  end

  def self.revoke_jwt(payload, user)
    # Do nothing
  end
end
