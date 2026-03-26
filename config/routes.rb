Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      
      post "signup", to: "auth#signup"
      post "login", to: "sessions#create"
      post "create_admin", to: "auth#create_admin"
      
      get "profile", to: "auth#profile"

      resources :trains, only: [:index, :show, :create, :update, :destroy]
      resources :stations, only: [:index, :create]
      resources :cities, only: [:index, :show, :create]
      resources :train_stops, only: [:index, :create]

      get "trains/search_by_name", to: "trains#search_by_name"
    end
  end
end