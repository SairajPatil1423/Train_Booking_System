# Train Booking System

Full-stack train booking project with a Next.js frontend and a Ruby on Rails backend API.

## Project Structure

- `frontend/`: Next.js 16 app for search, auth, booking, account, and admin flows
- `train_booking/`: Rails API for authentication, schedules, bookings, admin management, and fare logic

## Tech Stack

- Frontend: Next.js, React, Redux Toolkit, React Hook Form, Zod
- Backend: Ruby on Rails, Devise, Pundit-style policies, RSpec

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3001`.
By default it proxies browser API requests through `/api` to `http://127.0.0.1:3000`, which avoids local CORS issues during checkout and auth flows.

### Backend

```bash
cd train_booking
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

Run the Rails API with your local environment and database configuration.
If you need a different backend URL for the frontend proxy, set `API_PROXY_TARGET`.

## Common Commands

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd train_booking
bundle exec rspec
bin/rails routes
```

## Notes

- The repository root is the combined project container.
- Frontend and backend are intentionally separated into their own folders.
- Sensitive local files like environment files, build outputs, logs, temp files, and `config/master.key` are ignored.
