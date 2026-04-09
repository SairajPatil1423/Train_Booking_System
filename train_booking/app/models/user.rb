class User < ApplicationRecord
  ROLES = %w[user admin].freeze
  EMAIL_FORMAT = URI::MailTo::EMAIL_REGEXP
  INDIAN_PHONE_FORMAT = /\A\d{10}\z/

  devise :database_authenticatable, :registerable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, { user: "user", admin: "admin" }, default: :user

  has_many :bookings, dependent: :restrict_with_exception
  has_many :requested_cancellations, class_name: "Cancellation", foreign_key: :requested_by_id, dependent: :restrict_with_exception

  with_options presence: true do
    validates :email
    validates :phone
    validates :full_name
    validates :username
    validates :address
    validates :role
  end

  validates :email,
            uniqueness: { case_sensitive: false },
            format: { with: EMAIL_FORMAT },
            length: { maximum: 255 }
  validates :phone,
            format: { with: INDIAN_PHONE_FORMAT },
            length: { is: 10 }
  validates :full_name, length: { maximum: 120 }
  validates :username, uniqueness: { case_sensitive: false }, length: { maximum: 50 }
  validates :address, length: { maximum: 500 }
  validates :role, inclusion: { in: ROLES }
  validates :password, presence: true, length: { minimum: 6, maximum: 128 }, if: :password_required?

  def self.jwt_revoked?(_payload, _user)
    false
  end

  def self.revoke_jwt(_payload, _user)
  end
end
