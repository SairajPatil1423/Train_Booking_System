class NormalizeCoachLayouts < ActiveRecord::Migration[7.1]
  LEGACY_COACH_TYPE_MAP = {
    "AC" => "1ac",
    "Chair Car" => "2ac",
    "Sleeper" => "sleeper",
    "First Class" => "1ac"
  }.freeze

  COACH_LAYOUTS = {
    "1ac" => {
      column_letters: %w[A B C D],
      seat_types: %w[LB UB LB UB],
      rows: 10,
      columns: 4
    },
    "2ac" => {
      column_letters: %w[A B C D],
      seat_types: %w[W A A W],
      rows: 15,
      columns: 4
    },
    "sleeper" => {
      column_letters: %w[A B C D E F],
      seat_types: %w[LB MB UB SL SU SL],
      rows: 18,
      columns: 6
    }
  }.freeze

  class CoachRecord < ApplicationRecord
    self.table_name = "coaches"
    has_many :seats, class_name: "NormalizeCoachLayouts::SeatRecord", foreign_key: :coach_id
  end

  class SeatRecord < ApplicationRecord
    self.table_name = "seats"
    belongs_to :coach, class_name: "NormalizeCoachLayouts::CoachRecord", foreign_key: :coach_id
    has_many :ticket_allocations, class_name: "NormalizeCoachLayouts::TicketAllocationRecord", foreign_key: :seat_id
  end

  class FareRuleRecord < ApplicationRecord
    self.table_name = "fare_rules"
  end

  class TicketAllocationRecord < ApplicationRecord
    self.table_name = "ticket_allocations"
  end

  def up
    LEGACY_COACH_TYPE_MAP.each do |from_value, to_value|
      CoachRecord.where(coach_type: from_value).update_all(coach_type: to_value)
      FareRuleRecord.where(coach_type: from_value).update_all(coach_type: to_value)
    end

    CoachRecord.find_each do |coach|
      next unless COACH_LAYOUTS.key?(coach.coach_type)

      sync_layout!(coach)
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Coach layout normalization cannot be reversed safely"
  end

  private

  def sync_layout!(coach)
    config = COACH_LAYOUTS.fetch(coach.coach_type)
    desired_layout = config[:rows].times.flat_map do |row_index|
      config[:columns].times.map do |column_index|
        {
          seat_number: "#{row_index + 1}#{config[:column_letters][column_index]}",
          seat_type: config[:seat_types][column_index]
        }
      end
    end

    existing_seats = coach.seats.order(:seat_number, :id).to_a

    existing_seats.each_with_index do |seat, index|
      seat.update_columns(seat_number: "TMP#{index + 1}")
    end

    desired_layout.each_with_index do |definition, index|
      seat = existing_seats[index]

      if seat
        seat.update_columns(
          seat_number: definition[:seat_number],
          seat_type: definition[:seat_type],
          is_active: true
        )
      else
        SeatRecord.create!(
          coach_id: coach.id,
          seat_number: definition[:seat_number],
          seat_type: definition[:seat_type],
          is_active: true
        )
      end
    end

    existing_seats.drop(desired_layout.length).each do |seat|
      if seat.ticket_allocations.exists?
        seat.update_columns(is_active: false)
      else
        seat.destroy!
      end
    end

    coach.update_columns(total_seats: desired_layout.length)
  end
end
