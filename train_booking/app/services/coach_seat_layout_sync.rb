# CoachSeatLayoutSync syncs coach seats to the predefined layout config.
class CoachSeatLayoutSync
  TEMP_SEAT_PREFIX = "TMP".freeze

  def initialize(coach:)
    @coach = coach
  end

  def call
    ActiveRecord::Base.transaction do
      existing_seats = coach.seats.order(:seat_number, :id).to_a
      desired_layout = build_layout

      existing_seats.each_with_index do |seat, index|
        seat.update_columns(seat_number: "#{TEMP_SEAT_PREFIX}#{index + 1}")
      end

      desired_layout.each_with_index do |seat_definition, index|
        seat = existing_seats[index]

        if seat
          seat.update!(
            seat_number: seat_definition[:seat_number],
            seat_type: seat_definition[:seat_type],
            is_active: true
          )
        else
          coach.seats.create!(
            seat_number: seat_definition[:seat_number],
            seat_type: seat_definition[:seat_type],
            is_active: true
          )
        end
      end

      existing_seats.drop(desired_layout.length).each do |seat|
        if seat.ticket_allocations.exists?
          seat.update!(is_active: false)
        else
          seat.destroy!
        end
      end

      coach.update!(total_seats: desired_layout.length)
    end

    coach.reload
  end

  private

  attr_reader :coach

  def build_layout
    config = coach.layout_config

    config[:rows].times.flat_map do |row_index|
      config[:columns].times.map do |column_index|
        {
          seat_number: "#{row_index + 1}#{config[:column_letters][column_index]}",
          seat_type: config[:seat_types][column_index]
        }
      end
    end
  end
end
