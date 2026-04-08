require "rails_helper"

RSpec.describe "Admin bookings", type: :request do
  let!(:admin) { create(:user, :admin, email: "admin_bookings@example.com", username: "admin_bookings") }
  let!(:customer) { create(:user, email: "customer_bookings@example.com", username: "customer_bookings") }
  let!(:city) { create(:city, name: "Admin Booking City", state: "KA", country: "India") }
  let!(:src_station) { create(:station, city: city, name: "Start", code: "STA") }
  let!(:dst_station) { create(:station, city: city, name: "End", code: "END") }
  let!(:train) { create(:train, train_number: "22995", name: "Admin Booking Train", train_type: "Express", rating: 4.5) }
  let!(:coach) { create(:coach, :two_ac, train: train, coach_number: "A1") }
  let!(:seat) { create(:seat, coach: coach, seat_number: "1A", seat_type: "W", is_active: true) }
  let!(:schedule) do
    create(
      :schedule,
      train: train,
      travel_date: Date.new(2026, 6, 1),
      departure_time: "09:10",
      expected_arrival_time: "13:00",
      status: :scheduled
    )
  end

  before do
    create(
      :train_stop,
      train: train,
      station: src_station,
      stop_order: 1,
      arrival_time: "09:00",
      departure_time: "09:10",
      distance_from_origin_km: 0
    )
    create(
      :train_stop,
      train: train,
      station: dst_station,
      stop_order: 2,
      arrival_time: "12:50",
      departure_time: "13:00",
      distance_from_origin_km: 120
    )
  end

  describe "GET /admin/bookings" do
    context "when bookings exist" do
      let!(:booking) do
        create(
          :booking,
          user: customer,
          schedule: schedule,
          src_station: src_station,
          dst_station: dst_station,
          booking_ref: "BKG-ADMIN-001",
          total_fare: 240,
          status: :booked
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
      let!(:ticket_allocation) do
        create(
          :ticket_allocation,
          booking: booking,
          passenger: passenger,
          seat: seat,
          schedule: schedule,
          src_station: src_station,
          dst_station: dst_station,
          src_stop_order: 1,
          dst_stop_order: 2,
          pnr: "PNR-ADMIN-001",
          fare: 240,
          status: :booked
        )
      end

      it "returns the booking list" do
        get "/admin/bookings",
            headers: authorization_header(login_and_fetch_token(admin)),
            as: :json

        expect(response).to have_http_status(:ok)
        expect(json_body.dig("data", 0, "id")).to eq(booking.id)
        expect(json_body.dig("data", 0, "user", "email")).to eq(customer.email)
        expect(json_body.dig("data", 0, "ticket_allocations", 0, "id")).to eq(ticket_allocation.id)
      end
    end

    context "when there are no bookings" do
      it "returns an empty list" do
        get "/admin/bookings",
            headers: authorization_header(login_and_fetch_token(admin)),
            as: :json

        expect(response).to have_http_status(:ok)
        expect(json_body["data"]).to eq([])
        expect(json_body.dig("meta", "total_count")).to eq(0)
      end
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
