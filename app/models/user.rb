class User < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  enum role: {
    user: "user",
    admin: "admin"
  }
  
  has_many :bookings, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :phone, presence: true
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?
end