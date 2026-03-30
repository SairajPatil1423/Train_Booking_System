class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, { user: "user", admin: "admin" }, default: :user

  has_many :bookings, dependent: :restrict_with_exception
  has_many :requested_cancellations, class_name: "Cancellation", foreign_key: :requested_by_id, dependent: :restrict_with_exception

  validates :phone, length: { maximum: 20 }, allow_blank: true

  def self.jwt_revoked?(_payload, _user)
    false
  end

  def self.revoke_jwt(_payload, _user)
  end
end
