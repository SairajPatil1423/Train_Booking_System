require "rails_helper"

RSpec.describe Booking::Operation::Create do
  it "books the same selected seat when the segment does not overlap" do
    city = City.create!(name: "Transit", state: "KA", country: "India")
    stations = {
      a: Station.create!(city: city, name: "Alpha", code: "BKA"),
      c: Station.create!(city: city, name: "Charlie", code: "BKC"),
      e: Station.create!(city: city, name: "Echo", code: "BKE")
    }
    train = Train.create!(train_number: "22002", name: "Booking Express", train_type: "Express", rating: 4.2)

    [
      [stations.fetch(:a), 1, 0],
      [stations.fetch(:c), 2, 120],
      [stations.fetch(:e), 3, 240]
    ].each do |station, stop_order, distance|
      TrainStop.create!(
        train: train,
        station: station,
        stop_order: stop_order,
        arrival_time: "09:00",
        departure_time: "09:10",
        distance_from_origin_km: distance
      )
    end

    coach = Coach.create!(train: train, coach_number: "A1", coach_type: "2ac")
    seat_1 = Seat.create!(coach: coach, seat_number: "1A", seat_type: "W", is_active: true)
    Seat.create!(coach: coach, seat_number: "1B", seat_type: "A", is_active: true)
    schedule = Schedule.create!(
      train: train,
      travel_date: Date.new(2026, 4, 4),
      departure_time: "09:10",
      expected_arrival_time: "13:00",
      status: :scheduled,
      delay_minutes: 0
    )
    user = User.create!(
      email: "booking@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      full_name: "Booking User",
      username: "booking_user",
      address: "Seat street"
    )
    FareRule.create!(
      train: train,
      coach_type: "2ac",
      base_fare_per_km: 2.0,
      dynamic_multiplier: 1.0,
      valid_from: Date.new(2026, 1, 1),
      valid_to: Date.new(2026, 12, 31)
    )

    existing_booking = Booking.create!(
      user: user,
      schedule: schedule,
      src_station: stations.fetch(:a),
      dst_station: stations.fetch(:c),
      booking_ref: "BKG-EXIST-001",
      total_fare: 240,
      status: :booked
    )
    existing_passenger = Passenger.create!(
      booking: existing_booking,
      first_name: "Existing",
      last_name: "Traveller",
      age: 31,
      gender: "male",
      id_type: "Aadhaar",
      id_number: "1111"
    )
    TicketAllocation.create!(
      booking: existing_booking,
      passenger: existing_passenger,
      seat: seat_1,
      schedule: schedule,
      src_station: stations.fetch(:a),
      dst_station: stations.fetch(:c),
      src_stop_order: 1,
      dst_stop_order: 2,
      pnr: "PNR-EXIST-001",
      fare: 240,
      status: :booked
    )

    result = described_class.call(
      params: {
        user_id: user.id,
        schedule_id: schedule.id,
        src_station_id: stations.fetch(:c).id,
        dst_station_id: stations.fetch(:e).id,
        seat_id: seat_1.id,
        passengers: [
          {
            first_name: "New",
            last_name: "Passenger",
            age: 24,
            gender: "female",
            id_type: "Aadhaar",
            id_number: "2222"
          }
        ],
        payment: {
          payment_method: "upi",
          gateway_txn_id: "TXN-001"
        }
      }
    )

    expect(result).to be_success
    expect(result[:booking].ticket_allocations.first.seat_id).to eq(seat_1.id)
    expect(result[:booking].ticket_allocations.first.src_stop_order).to eq(2)
    expect(result[:booking].ticket_allocations.first.dst_stop_order).to eq(3)
  end

  it "rejects a selected seat when the requested segment overlaps" do
    city = City.create!(name: "Overlap", state: "KA", country: "India")
    stations = {
      a: Station.create!(city: city, name: "Alpha", code: "OLA"),
      b: Station.create!(city: city, name: "Bravo", code: "OLB"),
      c: Station.create!(city: city, name: "Charlie", code: "OLC"),
      e: Station.create!(city: city, name: "Echo", code: "OLE")
    }
    train = Train.create!(train_number: "22003", name: "Overlap Express", train_type: "Express", rating: 4.1)

    [
      [stations.fetch(:a), 1, 0],
      [stations.fetch(:b), 2, 80],
      [stations.fetch(:c), 3, 120],
      [stations.fetch(:e), 4, 240]
    ].each do |station, stop_order, distance|
      TrainStop.create!(
        train: train,
        station: station,
        stop_order: stop_order,
        arrival_time: "09:00",
        departure_time: "09:10",
        distance_from_origin_km: distance
      )
    end

    coach = Coach.create!(train: train, coach_number: "A1", coach_type: "2ac")
    seat = Seat.create!(coach: coach, seat_number: "1A", seat_type: "W", is_active: true)
    schedule = Schedule.create!(
      train: train,
      travel_date: Date.new(2026, 4, 5),
      departure_time: "09:10",
      expected_arrival_time: "13:00",
      status: :scheduled,
      delay_minutes: 0
    )
    user = User.create!(
      email: "overlap@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      full_name: "Overlap User",
      username: "overlap_user",
      address: "Conflict street"
    )
    FareRule.create!(
      train: train,
      coach_type: "2ac",
      base_fare_per_km: 2.0,
      dynamic_multiplier: 1.0,
      valid_from: Date.new(2026, 1, 1),
      valid_to: Date.new(2026, 12, 31)
    )

    existing_booking = Booking.create!(
      user: user,
      schedule: schedule,
      src_station: stations.fetch(:c),
      dst_station: stations.fetch(:e),
      booking_ref: "BKG-EXIST-002",
      total_fare: 240,
      status: :booked
    )
    existing_passenger = Passenger.create!(
      booking: existing_booking,
      first_name: "Existing",
      last_name: "Traveller",
      age: 31,
      gender: "male",
      id_type: "Aadhaar",
      id_number: "3333"
    )
    TicketAllocation.create!(
      booking: existing_booking,
      passenger: existing_passenger,
      seat: seat,
      schedule: schedule,
      src_station: stations.fetch(:c),
      dst_station: stations.fetch(:e),
      src_stop_order: 3,
      dst_stop_order: 4,
      pnr: "PNR-EXIST-002",
      fare: 240,
      status: :booked
    )

    result = described_class.call(
      params: {
        user_id: user.id,
        schedule_id: schedule.id,
        src_station_id: stations.fetch(:b).id,
        dst_station_id: stations.fetch(:e).id,
        seat_id: seat.id,
        passengers: [
          {
            first_name: "New",
            last_name: "Passenger",
            age: 24,
            gender: "female",
            id_type: "Aadhaar",
            id_number: "4444"
          }
        ],
        payment: {
          payment_method: "upi",
          gateway_txn_id: "TXN-002"
        }
      }
    )

    expect(result).not_to be_success
    expect(result[:error]).to include("already booked")
  end
end
