require "rails_helper"

RSpec.describe "User operations", type: :request do
  let!(:user) { create(:user, email: "user_ops@example.com", username: "user_ops") }
  let!(:city) { create(:city, name: "User City", state: "KA", country: "India") }
  let!(:src_station) { create(:station, city: city, name: "Alpha", code: "ALP") }
  let!(:mid_station) { create(:station, city: city, name: "Bravo", code: "BRV") }
  let!(:dst_station) { create(:station, city: city, name: "Charlie", code: "CHL") }
  let!(:train) { create(:train, train_number: "12001", name: "User Express", train_type: "Express", rating: 4.3) }
  let!(:coach) { create(:coach, train: train, coach_number: "S1", coach_type: "sleeper") }
  let!(:seat_one) { create(:seat, coach: coach, seat_number: "1", seat_type: "LB", is_active: true) }
  let!(:seat_two) { create(:seat, coach: coach, seat_number: "2", seat_type: "MB", is_active: true) }
  let!(:schedule) do
    create(
      :schedule,
      train: train,
      travel_date: Date.new(2026, 5, 15),
      departure_time: "08:00",
      expected_arrival_time: "13:00",
      status: :scheduled,
      delay_minutes: 0
    )
  end

  before do
    [
      [src_station, 1, "07:45", "08:00", 0],
      [mid_station, 2, "10:00", "10:05", 140],
      [dst_station, 3, "12:45", "13:00", 280]
    ].each do |station, stop_order, arrival_time, departure_time, distance|
      create(
        :train_stop,
        train: train,
        station: station,
        stop_order: stop_order,
        arrival_time: arrival_time,
        departure_time: departure_time,
        distance_from_origin_km: distance
      )
    end

    create(
      :fare_rule,
      train: train,
      coach_type: "sleeper",
      base_fare_per_km: 1.5,
      dynamic_multiplier: 1.0,
      valid_from: Date.new(2026, 1, 1),
      valid_to: Date.new(2026, 12, 31)
    )
  end

  describe "GET /schedules" do
    it "searches trains for a route and date" do
      get "/schedules",
          params: {
            src_station_id: src_station.id,
            dst_station_id: dst_station.id,
            travel_date: schedule.travel_date.to_s
          },
          headers: { "ACCEPT" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("data", 0, "id")).to eq(schedule.id)
      expect(json_body.dig("data", 0, "train", "train_number")).to eq("12001")
      expect(json_body.dig("data", 0, "availability", "available_seats")).to eq(2)
    end

    it "does not include cancelled schedules in search results" do
      cancelled_schedule = create(
        :schedule,
        train: train,
        travel_date: schedule.travel_date,
        departure_time: "15:00",
        expected_arrival_time: "20:00",
        status: :cancelled
      )

      get "/schedules",
          params: {
            src_station_id: src_station.id,
            dst_station_id: dst_station.id,
            travel_date: schedule.travel_date.to_s
          },
          headers: { "ACCEPT" => "application/json" }

      returned_ids = Array(json_body["data"]).map { |item| item["id"] }
      expect(returned_ids).to include(schedule.id)
      expect(returned_ids).not_to include(cancelled_schedule.id)
    end
  end

  describe "GET /schedules/:id" do
    it "rejects cancelled schedules for booking details" do
      cancelled_schedule = create(
        :schedule,
        train: train,
        travel_date: Date.new(2026, 5, 16),
        departure_time: "09:00",
        expected_arrival_time: "14:00",
        status: :cancelled
      )

      get "/schedules/#{cancelled_schedule.id}",
          params: {
            src_station_id: src_station.id,
            dst_station_id: dst_station.id
          },
          headers: authorization_header(login_and_fetch_token(user)),
          as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_body["error"]).to eq("This schedule has been cancelled.")
    end
  end

  describe "POST /bookings" do
    let(:booking_payload) do
      {
        schedule_id: schedule.id,
        src_station_id: src_station.id,
        dst_station_id: dst_station.id,
        seat_id: seat_one.id,
        coach_type: "sleeper",
        passengers: [
          attributes_for(
            :passenger,
            first_name: "Test",
            last_name: "Passenger",
            age: 27,
            gender: "female",
            id_type: "Aadhaar",
            id_number: "123412341234"
          )
        ],
        payment: attributes_for(
          :payment,
          payment_method: "upi",
          gateway_txn_id: "USER-BOOK-1"
        ).slice(:payment_method, :gateway_txn_id)
      }
    end

    it "books a train for the signed-in user" do
      expect do
        post "/bookings",
             params: {
               booking: booking_payload
             },
             headers: authorization_header(login_and_fetch_token(user)),
             as: :json
      end.to change(Booking, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Booking confirmed successfully.")
      expect(json_body.dig("booking", "user_id")).to eq(user.id)
      expect(json_body.dig("booking", "ticket_allocations", 0, "seat_id")).to eq(seat_one.id)
    end
  end

  describe "PATCH /bookings/:id/cancel_ticket" do
    let(:cancel_ticket_payload) do
      {
        ticket_allocation_id: first_allocation.id,
        reason: "Plan changed"
      }
    end

    let!(:booking) do
      create(
        :booking,
        user: user,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        booking_ref: "BKG-USER-CANCEL",
        total_fare: 420,
        status: :booked
      )
    end
    let!(:first_passenger) do
      create(
        :passenger,
        booking: booking,
        first_name: "First",
        last_name: "Passenger",
        age: 28,
        gender: "male",
        id_type: "Aadhaar",
        id_number: "111122223333"
      )
    end
    let!(:second_passenger) do
      create(
        :passenger,
        booking: booking,
        first_name: "Second",
        last_name: "Passenger",
        age: 26,
        gender: "female",
        id_type: "Aadhaar",
        id_number: "444455556666"
      )
    end
    let!(:first_allocation) do
      create(
        :ticket_allocation,
        booking: booking,
        passenger: first_passenger,
        seat: seat_one,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        src_stop_order: 1,
        dst_stop_order: 3,
        pnr: "PNR-USER-001",
        fare: 210,
        status: :booked
      )
    end
    let!(:second_allocation) do
      create(
        :ticket_allocation,
        booking: booking,
        passenger: second_passenger,
        seat: seat_two,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        src_stop_order: 1,
        dst_stop_order: 3,
        pnr: "PNR-USER-002",
        fare: 210,
        status: :booked
      )
    end
    let!(:payment) do
      create(
        :payment,
        booking: booking,
        amount: 420,
        payment_method: "upi",
        gateway_txn_id: "PAY-USER-1",
        status: :paid
      )
    end

    it "cancels one ticket from a booking" do
      patch "/bookings/#{booking.id}/cancel_ticket",
            params: {
              booking: cancel_ticket_payload
            },
            headers: authorization_header(login_and_fetch_token(user)),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to eq("Ticket cancelled successfully.")
      expect(json_body.dig("booking", "status")).to eq("partially_cancelled")
      expect(json_body.dig("booking", "ticket_allocations").find { |item| item["id"] == first_allocation.id }["status"]).to eq("cancelled")
      expect(json_body.dig("booking", "ticket_allocations").find { |item| item["id"] == second_allocation.id }["status"]).to eq("booked")
    end
  end

  def json_body
    JSON.parse(response.body)
  end

  def authorization_header(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def login_and_fetch_token(account)
    post "/users/sign_in",
         params: {
           user: {
             email: account.email,
             password: "password123"
           }
         },
         as: :json

    JSON.parse(response.body).fetch("token")
  end
end
