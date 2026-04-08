require "rails_helper"

RSpec.describe "Admin coaches", type: :request do
  let!(:admin) { create(:user, :admin, email: "admin_coach@example.com", username: "admin_coach") }
  let!(:train) { create(:train, train_number: "22994", name: "Coach Train", train_type: "Express", rating: 4.7) }

  describe "POST /admin/coaches" do
    let(:coach_payload) do
      {
        train_id: train.id,
        coach_number: "B1",
        coach_type: "2ac"
      }
    end

    it "creates a coach successfully" do
      expect do
        post "/admin/coaches",
             params: { coach: coach_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(Coach, :count).by(1)
        .and change(Seat, :count).by(Coach::COACH_LAYOUTS.fetch("2ac")[:total_seats])

      expect(response).to have_http_status(:created)
      expect(json_body["coach_number"]).to eq("B1")
      expect(json_body["coach_type"]).to eq("two_ac")
      expect(json_body["train_id"]).to eq(train.id)
      expect(json_body["total_seats"]).to eq(Coach::COACH_LAYOUTS.fetch("2ac")[:total_seats])
    end

    it "returns a failure for an invalid train" do
      invalid_payload = coach_payload.merge(train_id: SecureRandom.uuid)

      expect do
        post "/admin/coaches",
             params: { coach: invalid_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.not_to change(Coach, :count)

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
