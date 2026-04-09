class Coach < ApplicationRecord
  COACH_LAYOUTS = {
    "1ac" => {
      label: "1AC",
      rows: 10,
      columns: 4,
      column_letters: %w[A B C D],
      seat_types: %w[LB UB LB UB],
      total_seats: 40
    },
    "2ac" => {
      label: "2AC",
      rows: 15,
      columns: 4,
      column_letters: %w[A B C D],
      seat_types: %w[W A A W],
      total_seats: 60
    },
    "sleeper" => {
      label: "Sleeper",
      rows: 18,
      columns: 6,
      column_letters: %w[A B C D E F],
      seat_types: %w[LB MB UB SL SU SL],
      total_seats: 108
    }
  }.freeze

  belongs_to :train
  has_many :seats, dependent: :destroy

  enum :coach_type, {
    one_ac: "1ac",
    two_ac: "2ac",
    sleeper: "sleeper"
  }

  before_validation :assign_total_seats_from_layout

  with_options presence: true do
    validates :train
    validates :coach_number
    validates :coach_type
    validates :total_seats
  end

  validates :coach_number, uniqueness: { scope: :train_id }, length: { maximum: 10 }
  validates :coach_type, length: { maximum: 20 }
  validates :total_seats, numericality: { greater_than: 0 }
  validate :coach_type_supported

  def self.normalize_coach_type(value)
    raw_value = coach_types[value.to_s] || value.to_s
    raw_value.presence_in(COACH_LAYOUTS.keys)
  end

  def layout_config
    COACH_LAYOUTS.fetch(layout_key)
  end

  def api_coach_type
    layout_key
  end

  def rows
    layout_config[:rows]
  end

  def columns
    layout_config[:columns]
  end

  def layout_key
    self.class.normalize_coach_type(coach_type)
  end

  private

  def assign_total_seats_from_layout
    return if layout_key.blank?

    self.total_seats = COACH_LAYOUTS.fetch(layout_key)[:total_seats]
  end

  def coach_type_supported
    return if coach_type.blank?
    return if layout_key.present?

    errors.add(:coach_type, "is not included in the list")
  end
end
