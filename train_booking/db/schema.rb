# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_04_03_090000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "bookings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "schedule_id", null: false
    t.uuid "src_station_id", null: false
    t.uuid "dst_station_id", null: false
    t.string "booking_ref", limit: 20, null: false
    t.string "status", limit: 20, default: "pending", null: false
    t.decimal "total_fare", precision: 10, scale: 2, default: "0.0", null: false
    t.datetime "booked_at", default: -> { "now()" }, null: false
    t.index ["booking_ref"], name: "idx_bookings_ref", unique: true
    t.index ["dst_station_id"], name: "index_bookings_on_dst_station_id"
    t.index ["schedule_id"], name: "idx_bookings_schedule"
    t.index ["src_station_id"], name: "index_bookings_on_src_station_id"
    t.index ["user_id"], name: "idx_bookings_user"
  end

  create_table "cancellations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.uuid "ticket_allocation_id"
    t.uuid "requested_by_id", null: false
    t.text "reason"
    t.decimal "refund_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.string "status", limit: 20, default: "pending", null: false
    t.datetime "cancelled_at", default: -> { "now()" }, null: false
    t.index ["booking_id"], name: "idx_cancellations_booking"
    t.index ["requested_by_id"], name: "index_cancellations_on_requested_by_id"
    t.index ["ticket_allocation_id"], name: "idx_cancellations_allocation"
  end

  create_table "cities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.string "state", limit: 100
    t.string "country", limit: 100, null: false
    t.index ["name", "state", "country"], name: "idx_cities_name_state_country", unique: true
  end

  create_table "coaches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.string "coach_number", limit: 10, null: false
    t.string "coach_type", limit: 20, null: false
    t.integer "total_seats", null: false
    t.index ["train_id", "coach_number"], name: "idx_coaches_train_number", unique: true
    t.index ["train_id"], name: "idx_coaches_train"
  end

  create_table "fare_rules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.string "coach_type", limit: 20, null: false
    t.decimal "base_fare_per_km", precision: 10, scale: 2, null: false
    t.decimal "dynamic_multiplier", precision: 5, scale: 2, default: "1.0", null: false
    t.date "valid_from", null: false
    t.date "valid_to", null: false
    t.index ["train_id", "coach_type", "valid_from"], name: "idx_fare_rules_unique", unique: true
    t.index ["train_id"], name: "idx_fare_rules_train"
    t.check_constraint "valid_to >= valid_from", name: "fare_rules_dates_check"
  end

  create_table "passengers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.string "first_name", limit: 100, null: false
    t.string "last_name", limit: 100, null: false
    t.integer "age", null: false
    t.string "gender", limit: 10, null: false
    t.string "id_type", limit: 50
    t.string "id_number", limit: 100
    t.index ["booking_id"], name: "idx_passengers_booking"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "currency", limit: 10, default: "INR", null: false
    t.string "payment_method", limit: 50
    t.string "gateway_txn_id", limit: 100
    t.string "status", limit: 20, default: "pending", null: false
    t.datetime "paid_at"
    t.index ["booking_id"], name: "idx_payments_booking", unique: true
    t.index ["booking_id"], name: "index_payments_on_booking_id"
    t.index ["gateway_txn_id"], name: "idx_payments_gateway_txn"
  end

  create_table "schedules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.date "travel_date", null: false
    t.time "departure_time", null: false
    t.time "expected_arrival_time", null: false
    t.string "status", limit: 20, default: "scheduled", null: false
    t.integer "delay_minutes", default: 0, null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.index ["train_id", "travel_date"], name: "idx_schedules_train_date", unique: true
    t.index ["train_id"], name: "idx_schedules_train"
    t.index ["travel_date"], name: "idx_schedules_date"
  end

  create_table "seats", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "coach_id", null: false
    t.string "seat_number", limit: 10, null: false
    t.string "seat_type", limit: 20, null: false
    t.boolean "is_active", default: true, null: false
    t.index ["coach_id", "seat_number"], name: "idx_seats_coach_number", unique: true
    t.index ["coach_id"], name: "idx_seats_coach"
  end

  create_table "stations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "city_id", null: false
    t.string "name", limit: 100, null: false
    t.string "code", limit: 20, null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.index ["city_id"], name: "idx_stations_city"
    t.index ["code"], name: "idx_stations_code", unique: true
  end

  create_table "ticket_allocations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.uuid "passenger_id", null: false
    t.uuid "seat_id", null: false
    t.uuid "schedule_id", null: false
    t.uuid "src_station_id", null: false
    t.uuid "dst_station_id", null: false
    t.integer "src_stop_order", null: false
    t.integer "dst_stop_order", null: false
    t.string "pnr", limit: 20, null: false
    t.decimal "fare", precision: 10, scale: 2, null: false
    t.string "status", limit: 20, default: "confirmed", null: false
    t.index ["booking_id", "passenger_id"], name: "idx_ticket_alloc_passenger", unique: true
    t.index ["booking_id"], name: "idx_ticket_alloc_booking"
    t.index ["dst_station_id"], name: "index_ticket_allocations_on_dst_station_id"
    t.index ["passenger_id"], name: "index_ticket_allocations_on_passenger_id"
    t.index ["pnr"], name: "idx_ticket_alloc_pnr", unique: true
    t.index ["schedule_id"], name: "index_ticket_allocations_on_schedule_id"
    t.index ["seat_id", "schedule_id"], name: "idx_ticket_alloc_seat_schedule"
    t.index ["seat_id"], name: "index_ticket_allocations_on_seat_id"
    t.index ["src_station_id"], name: "index_ticket_allocations_on_src_station_id"
    t.check_constraint "dst_stop_order > src_stop_order", name: "ticket_allocations_stop_order_check"
  end

  create_table "train_stops", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.uuid "station_id", null: false
    t.integer "stop_order", null: false
    t.time "arrival_time"
    t.time "departure_time"
    t.integer "distance_from_origin_km", default: 0, null: false
    t.datetime "arrival_at"
    t.datetime "departure_at"
    t.index ["station_id"], name: "index_train_stops_on_station_id"
    t.index ["train_id", "station_id"], name: "idx_train_stops_station", unique: true
    t.index ["train_id", "stop_order"], name: "idx_train_stops_order", unique: true
    t.index ["train_id"], name: "idx_train_stops_train"
  end

  create_table "trains", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "train_number", limit: 20, null: false
    t.string "name", limit: 100, null: false
    t.string "train_type", limit: 50, null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.decimal "rating", precision: 4, scale: 2
    t.string "grade"
    t.index ["train_number"], name: "idx_trains_number", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", limit: 255, null: false
    t.string "phone", limit: 20
    t.string "role", limit: 20, default: "user", null: false
    t.string "encrypted_password", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "username", limit: 50
    t.text "address"
    t.string "full_name", limit: 120, null: false
    t.index ["email"], name: "idx_users_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "bookings", "schedules"
  add_foreign_key "bookings", "stations", column: "dst_station_id"
  add_foreign_key "bookings", "stations", column: "src_station_id"
  add_foreign_key "bookings", "users"
  add_foreign_key "cancellations", "bookings"
  add_foreign_key "cancellations", "ticket_allocations"
  add_foreign_key "cancellations", "users", column: "requested_by_id"
  add_foreign_key "coaches", "trains"
  add_foreign_key "fare_rules", "trains"
  add_foreign_key "passengers", "bookings"
  add_foreign_key "payments", "bookings"
  add_foreign_key "schedules", "trains"
  add_foreign_key "seats", "coaches"
  add_foreign_key "stations", "cities"
  add_foreign_key "ticket_allocations", "bookings"
  add_foreign_key "ticket_allocations", "passengers"
  add_foreign_key "ticket_allocations", "schedules"
  add_foreign_key "ticket_allocations", "seats"
  add_foreign_key "ticket_allocations", "stations", column: "dst_station_id"
  add_foreign_key "ticket_allocations", "stations", column: "src_station_id"
  add_foreign_key "train_stops", "stations"
  add_foreign_key "train_stops", "trains"
end
