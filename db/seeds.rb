puts "🌱 Seeding large dataset..."

# -----------------------------
# CLEAN DATABASE
# -----------------------------
[TrainStop, Station, City, Train, User].each do |model|
  model.destroy_all if Object.const_defined?(model.name)
end

puts "🧹 Old data cleared"

# -----------------------------
# USERS
# -----------------------------
puts "👤 Creating admins..."

5.times do |i|
  User.create!(
    email: "admin#{i}@test.com",
    password: "123456",
    phone: "900000000#{i}",
    role: "admin"
  )
end

puts "👥 Creating customers..."

50.times do |i|
  User.create!(
    email: "user#{i}@test.com",
    password: "123456",
    phone: "800000000#{i}",
    role: "user"
  )
end

puts "✅ Users created"

# -----------------------------
# CITIES
# -----------------------------
puts "🏙️ Creating cities..."

cities = [
  { name: "Mumbai", state: "Maharashtra", country: "India" },
  { name: "Pune", state: "Maharashtra", country: "India" },
  { name: "Hyderabad", state: "Telangana", country: "India" },
  { name: "Delhi", state: "Delhi", country: "India" },
  { name: "Bangalore", state: "Karnataka", country: "India" }
].map { |c| City.create!(c) }

puts "✅ Cities created"

# -----------------------------
# STATIONS (40)
# -----------------------------
puts "🚉 Creating stations..."

stations = []

40.times do |i|
  city = cities.sample

  stations << Station.create!(
    name: "Station #{i}",
    code: "ST#{i}",
    city_id: city.id,
    latitude: rand(10.0..30.0),
    longitude: rand(70.0..90.0)
  )
end

puts "✅ Stations created"

# -----------------------------
# TRAINS (20)
# -----------------------------
puts "🚆 Creating trains..."

trains = []

20.times do |i|
  trains << Train.create!(
    train_number: "10#{i}#{i}",
    name: "Train #{i}",
    train_type: ["Express", "Superfast", "Passenger"].sample,
    is_active: true
  )
end

puts "✅ Trains created"

# -----------------------------
# TRAIN STOPS (1 FULL ROUTE)
# -----------------------------
puts "🛤️ Creating train stops for one train..."

train = trains.first
selected_stations = stations.sample(10) # 10 stops route

selected_stations.each_with_index do |station, index|
  TrainStop.create!(
    train_id: train.id,
    station_id: station.id,
    stop_order: index + 1,
    arrival_time: index == 0 ? nil : "#{8 + index}:00",
    departure_time: "#{8 + index}:10",
    distance_from_origin_km: index * 100
  )
end

puts "✅ Train stops created"

puts "🎉 SEEDING COMPLETED SUCCESSFULLY!"