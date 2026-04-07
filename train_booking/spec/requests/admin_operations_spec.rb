require "rails_helper"

RSpec.describe "Admin operations", type: :request do
  let!(:admin) { create(:user, :admin, email: "admin_ops@example.com", username: "admin_ops") }
  let!(:customer) { create(:user, email: "customer_ops@example.com", username: "customer_ops") }
  let!(:city) { create(:city, name: "Admin City", state: "KA", country: "India") }
  let!(:station_one) { create(:station, city: city, name: "Start", code: "STA") }
  let!(:station_two) { create(:station, city: city, name: "End", code: "END") }
  let!(:train) { create(:train, train_number: "22991", name: "Admin Express", train_type: "Express", rating: 4.4) }
  let!(:schedule) do
    create(
      :schedule,
      train: train,
      travel_date: Date.new(2026, 6, 1),
      departure_time: "09:10",
      expected_arrival_time: "13:00",
      status: :scheduled,
      delay_minutes: 0
    )
  end
  let!(:coach) { create(:coach, :two_ac, train: train, coach_number: "A1") }
  let!(:seat) { create(:seat, coach: coach, seat_number: "1A", seat_type: "W", is_active: true) }
  let!(:booking) do
    create(
      :booking,
      user: customer,
      schedule: schedule,
      src_station: station_one,
      dst_station: station_two,
      booking_ref: "BKG-ADMIN-001",
      total_fare: 240,
      status: :booked
    )
  end
  let!(:payment) do
    create(
      :payment,
      booking: booking,
      amount: 240,
      payment_method: "upi",
      gateway_txn_id: "PAY-ADMIN-1",
      status: :paid
    )
  end
  let!(:passenger) do
    create(
      :passenger,
      booking: booking,
      first_name: "Booked",
      last_name: "Passenger",
      age: 30,
      gender: "female",
      id_type: "Aadhaar",
      id_number: "999988887777"
    )
  end
  let!(:ticket_allocation) do
    create(
      :ticket_allocation,
      booking: booking,
      passenger: passenger,
      seat: seat,
      schedule: schedule,
      src_station: station_one,
      dst_station: station_two,
      src_stop_order: 1,
      dst_stop_order: 2,
      pnr: "PNR-ADMIN-001",
      fare: 240,
      status: :booked
    )
  end

  before do
    create(
      :train_stop,
      train: train,
      station: station_one,
      stop_order: 1,
      arrival_time: "09:00",
      departure_time: "09:10",
      distance_from_origin_km: 0
    )
    create(
      :train_stop,
      train: train,
      station: station_two,
      stop_order: 2,
      arrival_time: "12:50",
      departure_time: "13:00",
      distance_from_origin_km: 120
    )
  end

  describe "GET /admin/bookings" do
    it "shows all bookings to an admin" do
      get "/admin/bookings",
          headers: authorization_header(login_and_fetch_token(admin)),
          as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("data", 0, "id")).to eq(booking.id)
      expect(json_body.dig("data", 0, "user_id")).to eq(customer.id)
    end
  end

  describe "POST /admin/trains" do
    let(:train_payload) do
      attributes_for(
        :train,
        train_number: "22992",
        name: "Created Train",
        train_type: "Superfast",
        rating: 4.8,
        grade: "A",
        is_active: true
      )
    end

    it "creates a train" do
      expect do
        post "/admin/trains",
             params: {
               train: train_payload
             },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(Train, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Train created successfully")
      expect(json_body.dig("train", "train_number")).to eq("22992")
    end
  end

  describe "POST /admin/train_stops" do
    let!(:second_city) { create(:city, name: "Second City", state: "KA", country: "India") }
    let!(:new_station) { create(:station, city: second_city, name: "Midway", code: "MID") }
    let(:train_stop_payload) do
      attributes_for(
        :train_stop,
        stop_order: 3,
        arrival_time: "14:00",
        departure_time: "14:10",
        distance_from_origin_km: 200
      ).merge(
        train_id: train.id,
        station_id: new_station.id
      )
    end

    it "creates a train stop" do
      expect do
        post "/admin/train_stops",
             params: {
               train_stop: train_stop_payload
             },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(TrainStop, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Train stop added successfully")
      expect(json_body.dig("train_stop", "station", "code")).to eq("MID")
    end
  end

  describe "POST /admin/coaches" do
    let(:coach_payload) do
      attributes_for(
        :coach,
        :one_ac,
        coach_number: "B1"
      ).slice(:coach_number, :coach_type).merge(train_id: train.id)
    end

    it "creates a coach with generated seats" do
      expect do
        post "/admin/coaches",
             params: {
               coach: coach_payload
             },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(Coach, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Coach created with seats")
      expect(json_body.dig("coach", "coach_number")).to eq("B1")
      expect(json_body.dig("coach", "seats")).not_to be_empty
    end
  end

  describe "POST /admin/fare_rules" do
    let(:fare_rule_payload) do
      attributes_for(
        :fare_rule,
        coach_type: "2ac",
        base_fare_per_km: 2.25,
        dynamic_multiplier: 1.10,
        valid_from: Date.new(2026, 1, 1),
        valid_to: Date.new(2026, 12, 31)
      ).merge(train_id: train.id)
    end

    it "creates a new fare rule" do
      expect do
        post "/admin/fare_rules",
             params: {
               fare_rule: fare_rule_payload
             },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(FareRule, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Fare rule created successfully")
      expect(json_body.dig("fare_rule", "coach_type")).to eq("2ac")
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
