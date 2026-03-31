Rails.application.routes.draw do
  devise_for :users, skip: :all

  devise_scope :user do
    post "/users", to: "users/registrations#create"
    post "/users/sign_in", to: "users/sessions#create"
    delete "/users/sign_out", to: "users/sessions#destroy"
  end

  get "up" => "rails/health#show", as: :rails_health_check

  resources :bookings, only: [:index, :create, :show, :update] do
    patch :cancel_ticket, on: :member
  end
  resources :stations, only: [:index]
  resources :schedules, only: [:index, :show]

  namespace :admin do
    resources :users, only: [:create]
    resources :bookings, only: [:index, :show]
    resources :cities, only: [:index, :create, :update, :destroy]
    resources :trains, only: [:index, :create, :update, :destroy]
    resources :train_stops, only: [:index, :create, :update, :destroy]
    resources :stations, only: [:index, :create, :update, :destroy]
    resources :fare_rules, only: [:index, :create, :update, :destroy]
    resources :coaches, only: [:index, :create, :update, :destroy] do
      resources :seats, only: [:index, :create, :update, :destroy]
    end
    resources :schedules, only: [:index, :create, :update, :destroy]
  end
end
