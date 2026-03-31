require "rails_helper"

RSpec.describe "Authentication", type: :request do
  describe "POST /users" do
    let(:valid_params) do
      {
        user: {
          email: "new_user@example.com",
          password: "password123",
          password_confirmation: "password123",
          phone: "9876543210"
        }
      }
    end

    it "registers a user and returns a token in the response body" do
      expect do
        post "/users", params: valid_params, as: :json
      end.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Signed up successfully.")
      expect(json_body["token"]).to be_present
      expect(json_body.dig("user", "email")).to eq("new_user@example.com")
      expect(json_body.dig("user", "role")).to eq("user")
    end

    it "returns a validation error when params are invalid" do
      post "/users", params: { user: { email: "", password: "short" } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_body["error"]).to be_present
    end
  end

  describe "POST /users/sign_in" do
    let!(:user) do
      User.create!(
        email: "existing_user@example.com",
        password: "password123",
        phone: "9999999999"
      )
    end

    it "logs in a user and returns a token in the response body" do
      post "/users/sign_in", params: {
        user: {
          email: user.email,
          password: "password123"
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to eq("Logged in successfully.")
      expect(json_body["token"]).to be_present
      expect(json_body.dig("user", "id")).to eq(user.id)
    end

    it "rejects invalid credentials" do
      post "/users/sign_in", params: {
        user: {
          email: user.email,
          password: "wrong-password"
        }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json_body["error"]).to be_present
    end
  end

  describe "DELETE /users/sign_out" do
    let!(:user) do
      User.create!(
        email: "logout_user@example.com",
        password: "password123",
        phone: "8888888888"
      )
    end

    it "returns success when an authorization header is present" do
      token = login_and_fetch_token(user)

      delete "/users/sign_out", headers: authorization_header(token), as: :json

      expect(response).to have_http_status(:ok)
      expect(json_body["message"]).to eq("Logged out successfully.")
    end

    it "returns unauthorized when no authorization header is present" do
      delete "/users/sign_out", as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json_body["error"]).to eq("No active session.")
    end
  end

  def json_body
    JSON.parse(response.body)
  end

  def authorization_header(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def login_and_fetch_token(user)
    post "/users/sign_in", params: {
      user: {
        email: user.email,
        password: "password123"
      }
    }, as: :json

    json_body.fetch("token")
  end
end
