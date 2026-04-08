require "rails_helper"

RSpec.describe "User train search", type: :request do
  let!(:city) { create(:city, name: "Search City", state: "KA", country: "India") }
  let!(:src_station) { create(:station, city: city, name: "Alpha", code: "ALP") }
  let!(:mid_station) { create(:station, city: city, name: "Bravo", code: "BRV") }
  let!(:dst_station) { create(:station, city: city, name: "Charlie", code: "CHL") }
  let!(:train) { create(:train, train_number: "12001", name: "Search Express", train_type: "Express", rating: 4.3) }
  let!(:coach) { create(:coach, train: train, coach_number: "S1", coach_type: "sleeper") }
  let!(:seat) { create(:seat, coach: coach, seat_number: "1", seat_type: "LB", is_active: true) }
  let(:travel_date) { Date.current.advance(days: 30) }
  let!(:schedule) do
    create(
      :schedule,
      train: train,
      travel_date: travel_date,
      departure_time: "08:00",
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
      arrival_at: Time.zone.parse("#{travel_date} 08:00:00"),
      departure_at: Time.zone.parse("#{travel_date} 08:10:00"),
      arrival_time: "08:00:00",
      departure_time: "08:10:00",
      distance_from_origin_km: 0
    )
    create(
      :train_stop,
      train: train,
      station: mid_station,
      stop_order: 2,
      arrival_at: Time.zone.parse("#{travel_date} 10:00:00"),
      departure_at: Time.zone.parse("#{travel_date} 10:05:00"),
      arrival_time: "10:00:00",
      departure_time: "10:05:00",
      distance_from_origin_km: 120
    )
    create(
      :train_stop,
      train: train,
      station: dst_station,
      stop_order: 3,
      arrival_at: Time.zone.parse("#{travel_date} 12:50:00"),
      departure_at: Time.zone.parse("#{travel_date} 13:00:00"),
      arrival_time: "12:50:00",
      departure_time: "13:00:00",
      distance_from_origin_km: 260
    )
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
    it "returns search results for a valid route" do
      get "/schedules",
          params: {
            src_station_id: src_station.id,
            dst_station_id: dst_station.id,
            travel_date: travel_date.to_s,
            page: 1,
            per_page: 10
          }

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("data", 0, "id")).to eq(schedule.id)
      expect(json_body.dig("data", 0, "train", "train_number")).to eq(train.train_number)
    end

    it "returns an empty list when no trains match the route" do
      other_city = create(:city, name: "Other City", state: "MH", country: "India")
      other_src = create(:station, city: other_city, name: "North", code: "NTH")
      other_dst = create(:station, city: other_city, name: "South", code: "STH")

      get "/schedules",
          params: {
            src_station_id: other_src.id,
            dst_station_id: other_dst.id,
            travel_date: travel_date.to_s,
            page: 1,
            per_page: 10
          }

      expect(response).to have_http_status(:ok)
      expect(json_body["data"]).to eq([])
      expect(json_body.dig("meta", "total_count")).to eq(0)
    end

    it "returns an error for invalid params" do
      get "/schedules",
          params: {
            src_station_id: src_station.id,
            dst_station_id: dst_station.id
          }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["errors"]).to be_an(Array)
      expect(json_body["errors"].join).to include("src_station_id, dst_station_id, and travel_date are required")
    end
  end

  def json_body
    JSON.parse(response.body)
  end
end
