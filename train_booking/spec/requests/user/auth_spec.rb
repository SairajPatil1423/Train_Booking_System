require "rails_helper"

RSpec.describe "User authentication", type: :request do
  let!(:user) do
    create(
      :user,
      email: "login_user@example.com",
      username: "login_user",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  describe "POST /users/sign_in" do
    it "logs in with valid credentials" do
      post "/users/sign_in",
           params: {
             user: {
               email: user.email,
               password: "password123"
             }
           },
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to eq("Logged in successfully.")
      expect(json_body.dig("user", "email")).to eq(user.email)
      expect(json_body["token"]).to be_present
    end

    it "rejects a wrong password" do
      post "/users/sign_in",
           params: {
             user: {
               email: user.email,
               password: "wrong-password"
             }
           },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json_body["error"]).to eq("Invalid email or password.")
    end

    it "rejects a missing user" do
      post "/users/sign_in",
           params: {
             user: {
               email: "missing_user@example.com",
               password: "password123"
             }
           },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json_body["error"]).to eq("Invalid email or password.")
    end
  end

  def json_body
    JSON.parse(response.body)
  end
end
