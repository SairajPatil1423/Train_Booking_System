require "rails_helper"

RSpec.describe "Admin schedules", type: :request do
  let!(:admin) { create(:user, :admin, email: "admin_sched@example.com", username: "admin_sched") }
  let!(:train) { create(:train, train_number: "22993", name: "Schedule Train", train_type: "Express", rating: 4.6) }

  describe "POST /admin/schedules" do
    let(:schedule_payload) do
      {
        train_id: train.id,
        travel_date: Date.new(2026, 7, 1).to_s,
        departure_time: "09:10",
        expected_arrival_time: "13:00",
        status: "scheduled",
        delay_minutes: 0
      }
    end

    it "creates a schedule successfully" do
      expect do
        post "/admin/schedules",
             params: { schedule: schedule_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(Schedule, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Schedule created")
      expect(json_body.dig("schedule", "train_id")).to eq(train.id)
    end

    it "returns a failure for an invalid train id" do
      invalid_payload = schedule_payload.merge(train_id: SecureRandom.uuid)

      expect do
        post "/admin/schedules",
             params: { schedule: invalid_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.not_to change(Schedule, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_body["errors"].join).to include("not found")
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
