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

ActiveRecord::Schema[7.1].define(version: 2026_03_26_131952) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "bookings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "schedule_id", null: false
    t.string "status", default: "pending", null: false
    t.decimal "total_amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["schedule_id"], name: "index_bookings_on_schedule_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "cancellations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.decimal "refund_amount", precision: 10, scale: 2, default: "0.0", null: false
    t.string "status", default: "initiated", null: false
    t.datetime "cancelled_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_cancellations_on_booking_id", unique: true
  end

  create_table "cities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "state", null: false
    t.string "country", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name", "state", "country"], name: "index_cities_on_name_and_state_and_country", unique: true
  end

  create_table "coaches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "schedule_id", null: false
    t.string "coach_number", null: false
    t.string "coach_type", null: false
    t.integer "total_seats", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["schedule_id", "coach_number"], name: "index_coaches_on_schedule_id_and_coach_number", unique: true
  end

  create_table "passengers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.string "name", null: false
    t.integer "age", null: false
    t.string "gender", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_passengers_on_booking_id"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "status", default: "pending", null: false
    t.string "payment_method", null: false
    t.string "transaction_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id", unique: true
    t.index ["transaction_id"], name: "index_payments_on_transaction_id", unique: true
  end

  create_table "schedules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.date "journey_date", null: false
    t.string "status", default: "scheduled", null: false
    t.integer "total_distance_km", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["train_id", "journey_date"], name: "index_schedules_on_train_id_and_journey_date", unique: true
  end

  create_table "seats", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "coach_id", null: false
    t.string "seat_number", null: false
    t.string "seat_type", null: false
    t.boolean "is_available", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coach_id", "seat_number"], name: "index_seats_on_coach_id_and_seat_number", unique: true
  end

  create_table "stations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "code"
    t.uuid "city_id"
    t.decimal "latitude"
    t.decimal "longitude"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ticket_allocations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.uuid "passenger_id", null: false
    t.uuid "seat_id", null: false
    t.string "status", default: "allocated", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "from_stop_id", null: false
    t.uuid "to_stop_id", null: false
    t.uuid "src_stop_id", null: false
    t.uuid "dst_stop_id", null: false
    t.index ["dst_stop_id"], name: "index_ticket_allocations_on_dst_stop_id"
    t.index ["from_stop_id"], name: "index_ticket_allocations_on_from_stop_id"
    t.index ["passenger_id"], name: "index_ticket_allocations_on_passenger_id", unique: true
    t.index ["seat_id"], name: "index_ticket_allocations_on_seat_id"
    t.index ["src_stop_id"], name: "index_ticket_allocations_on_src_stop_id"
    t.index ["to_stop_id"], name: "index_ticket_allocations_on_to_stop_id"
  end

  create_table "train_stops", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "train_id", null: false
    t.uuid "station_id", null: false
    t.integer "stop_order", null: false
    t.time "arrival_time"
    t.time "departure_time"
    t.integer "distance_from_origin_km", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["train_id", "station_id"], name: "index_train_stops_on_train_id_and_station_id", unique: true
    t.index ["train_id", "stop_order"], name: "index_train_stops_on_train_id_and_stop_order", unique: true
  end

  create_table "trains", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "train_number", null: false
    t.string "name", null: false
    t.string "train_type", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["train_number"], name: "index_trains_on_train_number", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "phone"
    t.string "role", default: "user", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "bookings", "schedules"
  add_foreign_key "bookings", "users"
  add_foreign_key "cancellations", "bookings"
  add_foreign_key "coaches", "schedules"
  add_foreign_key "passengers", "bookings"
  add_foreign_key "payments", "bookings"
  add_foreign_key "schedules", "trains"
  add_foreign_key "seats", "coaches"
  add_foreign_key "ticket_allocations", "bookings"
  add_foreign_key "ticket_allocations", "passengers"
  add_foreign_key "ticket_allocations", "seats"
  add_foreign_key "ticket_allocations", "train_stops", column: "dst_stop_id"
  add_foreign_key "ticket_allocations", "train_stops", column: "from_stop_id"
  add_foreign_key "ticket_allocations", "train_stops", column: "src_stop_id"
  add_foreign_key "ticket_allocations", "train_stops", column: "to_stop_id"
  add_foreign_key "train_stops", "stations"
  add_foreign_key "train_stops", "trains"
end
