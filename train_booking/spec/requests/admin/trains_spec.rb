require "rails_helper"

RSpec.describe "Admin trains", type: :request do
  let!(:admin) { create(:user, :admin, email: "admin_trains@example.com", username: "admin_trains") }

  describe "POST /admin/trains" do
    let(:train_payload) do
      attributes_for(
        :train,
        train_number: "22992",
        name: "Created Train",
        train_type: "Express",
        rating: 4.8,
        grade: "A",
        is_active: true
      )
    end

    it "creates a train successfully" do
      expect do
        post "/admin/trains",
             params: { train: train_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.to change(Train, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Train created successfully")
      expect(json_body.dig("train", "train_number")).to eq("22992")
    end

    it "returns a failure for duplicate train numbers" do
      create(:train, train_number: train_payload[:train_number], name: "Existing", train_type: "Express", rating: 4.1)

      expect do
        post "/admin/trains",
             params: { train: train_payload },
             headers: authorization_header(login_and_fetch_token(admin)),
             as: :json
      end.not_to change(Train, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_body["errors"].join).to include("already exists")
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
