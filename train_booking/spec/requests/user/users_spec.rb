require "rails_helper"

RSpec.describe "User signup", type: :request do
  describe "POST /users" do
    let(:signup_payload) do
      {
        email: "new_user@example.com",
        password: "password123",
        password_confirmation: "password123",
        phone: "9876543210",
        full_name: "New User",
        username: "new_user",
        address: "123 Railway Street",
      }
    end

    it "creates a user successfully" do
      expect do
        post "/users", params: { user: signup_payload }, as: :json
      end.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_body["message"]).to eq("Signed up successfully.")
      expect(json_body.dig("user", "email")).to eq("new_user@example.com")
      expect(json_body["token"]).to be_present
    end

    it "returns a failure when the email already exists" do
      create(:user, email: signup_payload[:email], username: "existing_user")

      expect do
        post "/users", params: { user: signup_payload }, as: :json
      end.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["error"]).to be_present
    end

    it "returns a failure for invalid params" do
      invalid_payload = signup_payload.merge(full_name: "", username: "", address: "")

      expect do
        post "/users", params: { user: invalid_payload }, as: :json
      end.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["error"]).to be_present
    end
  end

  def json_body
    JSON.parse(response.body)
  end
end
