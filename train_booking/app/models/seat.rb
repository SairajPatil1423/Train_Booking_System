class Seat < ApplicationRecord
  SEAT_TYPES = %w[LB UB MB SL SU W A].freeze

  belongs_to :coach
  has_many :ticket_allocations, dependent: :restrict_with_exception

  scope :active_for_train, lambda { |train_id|
    joins(:coach).where(seats: { is_active: true }, coaches: { train_id: train_id })
  }

  validates :seat_number, :seat_type, presence: true
  validates :seat_type, inclusion: { in: SEAT_TYPES }

  def self.available_for_segment(schedule:, src_stop_order:, dst_stop_order:, coach_type: nil)
    relation = active_for_train(schedule.train_id)
    normalized_coach_type = Coach.normalize_coach_type(coach_type)
    relation = relation.where(coaches: { coach_type: normalized_coach_type }) if normalized_coach_type.present?

    overlap_sql = ApplicationRecord.sanitize_sql_array(
      [
        "ticket_allocations.schedule_id = ? "\
        "AND ticket_allocations.status != ? "\
        "AND ticket_allocations.seat_id = seats.id "\
        "AND ? < ticket_allocations.dst_stop_order "\
        "AND ? > ticket_allocations.src_stop_order",
        schedule.id,
        "cancelled",
        src_stop_order,
        dst_stop_order
      ]
    )

    relation.where("NOT EXISTS (SELECT 1 FROM ticket_allocations WHERE #{overlap_sql})")
  end
end
