Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :admin do
    resources :trains, only: [:index, :create, :update, :destroy]
    resources :stations, only: [:index, :create, :update, :destroy]
  end
end
