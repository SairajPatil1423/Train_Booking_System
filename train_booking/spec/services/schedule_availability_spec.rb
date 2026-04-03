require "rails_helper"

RSpec.describe ScheduleAvailability, type: :service do
  it "allows adjacent segments and blocks overlapping ones using stop_order" do
    city = City.create!(name: "Metro", state: "KA", country: "India")
    stations = {
      a: Station.create!(city: city, name: "Alpha", code: "ALP"),
      b: Station.create!(city: city, name: "Bravo", code: "BRV"),
      c: Station.create!(city: city, name: "Charlie", code: "CHR"),
      d: Station.create!(city: city, name: "Delta", code: "DLT"),
      e: Station.create!(city: city, name: "Echo", code: "ECH")
    }
    train = Train.create!(train_number: "12001", name: "Segment Express", train_type: "Express", rating: 4.5)

    %i[a b c d e].each_with_index do |key, index|
      TrainStop.create!(
        train: train,
        station: stations.fetch(key),
        stop_order: index + 1,
        arrival_time: "08:00",
        departure_time: "08:05",
        distance_from_origin_km: index * 50
      )
    end

    coach = Coach.create!(train: train, coach_number: "S1", coach_type: "sleeper")
    seat_1 = Seat.create!(coach: coach, seat_number: "1A", seat_type: "LB", is_active: true)
    seat_2 = Seat.create!(coach: coach, seat_number: "1B", seat_type: "MB", is_active: true)
    schedule = Schedule.create!(
      train: train,
      travel_date: Date.new(2026, 4, 3),
      departure_time: "08:05",
      expected_arrival_time: "12:00",
      status: :scheduled,
      delay_minutes: 0
    )
    user = User.create!(
      email: "availability@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      full_name: "Availability User",
      username: "availability_user",
      address: "Route street"
    )
    booking = Booking.create!(
      user: user,
      schedule: schedule,
      src_station: stations.fetch(:a),
      dst_station: stations.fetch(:c),
      booking_ref: "BKG-AVAIL-001",
      total_fare: 500,
      status: :booked
    )
    passenger = Passenger.create!(
      booking: booking,
      first_name: "Alex",
      last_name: "Stone",
      age: 28,
      gender: "male",
      id_type: "Aadhaar",
      id_number: "1234"
    )
    TicketAllocation.create!(
      booking: booking,
      passenger: passenger,
      seat: seat_1,
      schedule: schedule,
      src_station: stations.fetch(:a),
      dst_station: stations.fetch(:c),
      src_stop_order: 1,
      dst_stop_order: 3,
      pnr: "PNR-AVAIL-001",
      fare: 500,
      status: :booked
    )

    adjacent_segment = described_class.new(
      schedule: schedule,
      src_station_id: stations.fetch(:c).id,
      dst_station_id: stations.fetch(:e).id
    ).call
    overlapping_segment = described_class.new(
      schedule: schedule,
      src_station_id: stations.fetch(:b).id,
      dst_station_id: stations.fetch(:d).id
    ).call

    expect(adjacent_segment[:available_seats]).to eq(2)
    expect(adjacent_segment[:coach_type_availability].dig("sleeper", :available_seats)).to eq(2)
    expect(overlapping_segment[:available_seats]).to eq(1)
    expect(overlapping_segment[:coach_type_availability].dig("sleeper", :available_seats)).to eq(1)
  end
end
