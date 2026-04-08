require "rails_helper"

RSpec.describe "User bookings", type: :request do
  let!(:user) do
    create(
      :user,
      email: "book_user@example.com",
      username: "book_user",
      password: "password123",
      password_confirmation: "password123"
    )
  end
  let!(:city) { create(:city, name: "Booking City", state: "KA", country: "India") }
  let!(:src_station) { create(:station, city: city, name: "Alpha", code: "ALP") }
  let!(:dst_station) { create(:station, city: city, name: "Charlie", code: "CHL") }
  let!(:train) { create(:train, train_number: "12002", name: "Booking Express", train_type: "Express", rating: 4.4) }
  let!(:coach) { create(:coach, train: train, coach_number: "S1", coach_type: "sleeper") }
  let!(:seat_one) { create(:seat, coach: coach, seat_number: "1", seat_type: "LB", is_active: true) }
  let!(:seat_two) { create(:seat, coach: coach, seat_number: "2", seat_type: "MB", is_active: true) }
  let!(:schedule) do
    create(
      :schedule,
      train: train,
      travel_date: Date.new(2026, 6, 1),
      departure_time: "08:00",
      expected_arrival_time: "13:00",
      status: :scheduled
    )
  end

  before do
    create(:train_stop, train: train, station: src_station, stop_order: 1, distance_from_origin_km: 0)
    create(:train_stop, train: train, station: dst_station, stop_order: 2, distance_from_origin_km: 260)
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

  describe "POST /bookings" do
    let(:booking_payload) do
      {
        schedule_id: schedule.id,
        src_station_id: src_station.id,
        dst_station_id: dst_station.id,
        coach_type: "sleeper",
        seat_ids: [seat_one.id],
        passengers: [
          {
            first_name: "Aarav",
            last_name: "Sharma",
            age: 28,
            gender: "male",
            id_type: "Aadhaar",
            id_number: "111122223333"
          }
        ],
        payment: {
          payment_method: "upi",
          gateway_txn_id: "USER-BOOK-1"
        }
      }
    end

    it "creates a booking successfully" do
      expect do
        post "/bookings",
             params: { booking: booking_payload },
             headers: authorization_header(login_and_fetch_token(user)),
             as: :json
      end.to change(Booking, :count).by(1)
        .and change(Passenger, :count).by(1)
        .and change(TicketAllocation, :count).by(1)
        .and change(Payment, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Booking confirmed successfully.")
      expect(json_body.dig("booking", "user_id")).to eq(user.id)
      expect(json_body.dig("booking", "passengers").size).to eq(1)
      expect(json_body.dig("booking", "ticket_allocations").size).to eq(1)
      expect(json_body.dig("booking", "payment", "status")).to eq("paid")
    end

    it "returns a failure when the selected seat is already booked" do
      existing_booking = create(
        :booking,
        user: user,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        booking_ref: "BKG-EXIST-001",
        total_fare: 420,
        status: :booked
      )
      existing_passenger = create(
        :passenger,
        booking: existing_booking,
        first_name: "Booked",
        last_name: "Passenger",
        age: 29,
        gender: "female",
        id_type: "Aadhaar",
        id_number: "444455556666"
      )
      create(
        :ticket_allocation,
        booking: existing_booking,
        passenger: existing_passenger,
        seat: seat_one,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        src_stop_order: 1,
        dst_stop_order: 2,
        pnr: "PNR-EXIST-001",
        fare: 420,
        status: :booked
      )

      expect do
        post "/bookings",
             params: { booking: booking_payload },
             headers: authorization_header(login_and_fetch_token(user)),
             as: :json
      end.not_to change(Booking, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["errors"].join).to include("already booked")
    end

    it "returns a failure for invalid passenger data" do
      invalid_payload = booking_payload.deep_dup
      invalid_payload[:passengers][0][:first_name] = ""

      expect do
        post "/bookings",
             params: { booking: invalid_payload },
             headers: authorization_header(login_and_fetch_token(user)),
             as: :json
      end.not_to change(Booking, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["errors"]).to be_an(Array)
    end
  end

  describe "PATCH /bookings/:id/cancel_ticket" do
    let!(:booking) do
      create(
        :booking,
        user: user,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        booking_ref: "BKG-CANCEL-001",
        total_fare: 420,
        status: :booked
      )
    end
    let!(:passenger) do
      create(
        :passenger,
        booking: booking,
        first_name: "Cancel",
        last_name: "Passenger",
        age: 30,
        gender: "male",
        id_type: "Aadhaar",
        id_number: "777788889999"
      )
    end
    let!(:ticket_allocation) do
      create(
        :ticket_allocation,
        booking: booking,
        passenger: passenger,
        seat: seat_two,
        schedule: schedule,
        src_station: src_station,
        dst_station: dst_station,
        src_stop_order: 1,
        dst_stop_order: 2,
        pnr: "PNR-CANCEL-001",
        fare: 210,
        status: :booked
      )
    end

    it "cancels a ticket successfully" do
      patch "/bookings/#{booking.id}/cancel_ticket",
            params: {
              booking: {
                ticket_allocation_id: ticket_allocation.id,
                reason: "Changed travel plans"
              }
            },
            headers: authorization_header(login_and_fetch_token(user)),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to eq("Ticket cancelled successfully.")
      expect(json_body.dig("booking", "status")).to eq("cancelled")
      expect(ticket_allocation.reload.status).to eq("cancelled")
    end

    it "returns a failure when the ticket is already cancelled" do
      ticket_allocation.update!(status: :cancelled)

      patch "/bookings/#{booking.id}/cancel_ticket",
            params: {
              booking: {
                ticket_allocation_id: ticket_allocation.id,
                reason: "Changed travel plans"
              }
            },
            headers: authorization_header(login_and_fetch_token(user)),
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["errors"].join).to include("already cancelled")
    end

    it "returns a failure for an invalid booking" do
      patch "/bookings/#{SecureRandom.uuid}/cancel_ticket",
            params: {
              booking: {
                ticket_allocation_id: ticket_allocation.id,
                reason: "Changed travel plans"
              }
            },
            headers: authorization_header(login_and_fetch_token(user)),
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["errors"].join).to include("Booking not found")
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
