Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      
      post "signup", to: "auth#signup"
      post "login", to: "sessions#create"

      
      get "profile", to: "auth#profile"

      resources :trains, only: [:index, :show, :create]
    end
  end
end