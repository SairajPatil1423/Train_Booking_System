PASSWORD = "password123".freeze
SCHEDULE_DAYS = 21
SEED_ROUTE_BASE_DATE = Date.new(2000, 1, 1)
COMMON_SEARCH_ROUTES = [
  ["BCT", "ADI"],
  ["ADI", "BCT"],
  ["ADI", "NDLS"],
  ["NDLS", "ADI"],
  ["MAS", "SC"],
  ["SC", "MAS"],
  ["LTT", "NDLS"],
  ["NDLS", "LTT"],
  ["BCT", "BRC"],
  ["BRC", "NDLS"],
  ["MAS", "BZA"],
  ["BPL", "NDLS"],
  ["NGP", "SC"],
  ["BZA", "MAS"],
  ["PUNE", "SBC"],
  ["SBC", "PUNE"],
  ["BCT", "JP"],
  ["JP", "BCT"],
  ["KOTA", "NDLS"],
  ["ET", "LTT"]
].freeze

ADMIN_PROFILES = [
  { full_name: "Aarav Menon", username: "admin_ops_1", email: "admin1@trainbooking.com", phone: "9000000001", address: "Rail Operations HQ 1, Central Admin Block, New Delhi, India" },
  { full_name: "Meera Sharma", username: "admin_ops_2", email: "admin2@trainbooking.com", phone: "9000000002", address: "Rail Operations HQ 2, Central Admin Block, New Delhi, India" }
].freeze

USER_PROFILES = [
  ["Priya Sharma", "priya.sharma", "Mumbai, Maharashtra"],
  ["Rahul Verma", "rahul.verma", "Pune, Maharashtra"],
  ["Ananya Iyer", "ananya.iyer", "Chennai, Tamil Nadu"],
  ["Arjun Reddy", "arjun.reddy", "Hyderabad, Telangana"],
  ["Neha Kapoor", "neha.kapoor", "Delhi, Delhi"],
  ["Rohan Patel", "rohan.patel", "Ahmedabad, Gujarat"],
  ["Sneha Kulkarni", "sneha.kulkarni", "Bengaluru, Karnataka"],
  ["Vikram Singh", "vikram.singh", "Jaipur, Rajasthan"],
  ["Kavya Nair", "kavya.nair", "Kochi, Kerala"],
  ["Aditya Joshi", "aditya.joshi", "Nagpur, Maharashtra"]
].freeze

def build_stop(code:, distance_km:, arrival_time: nil, departure_time: nil, arrival_day: 0, departure_day: 0)
  {
    code: code,
    distance_km: distance_km,
    arrival_time: arrival_time,
    departure_time: departure_time,
    arrival_day: arrival_day,
    departure_day: departure_day
  }
end

def stop_datetime(day_offset, time_value)
  return nil if time_value.blank?

  Time.zone.parse("#{SEED_ROUTE_BASE_DATE + day_offset} #{time_value}")
end

puts "Cleaning existing data..."
Cancellation.destroy_all
TicketAllocation.destroy_all
Passenger.destroy_all
Payment.destroy_all
Booking.destroy_all
Seat.destroy_all
Coach.destroy_all
FareRule.destroy_all
Schedule.destroy_all
TrainStop.destroy_all
Train.destroy_all
Station.destroy_all
City.destroy_all
User.destroy_all

puts "Creating admin users..."
ADMIN_PROFILES.each do |profile|
  User.create!(
    email: profile[:email],
    full_name: profile[:full_name],
    username: profile[:username],
    address: profile[:address],
    password: PASSWORD,
    phone: profile[:phone],
    role: :admin
  )
end

puts "Creating regular users..."
40.times do |index|
  name, username_seed, city_label = USER_PROFILES[index % USER_PROFILES.length]
  User.create!(
    email: "user#{index + 1}@trainbooking.com",
    full_name: "#{name} #{index >= USER_PROFILES.length ? index / USER_PROFILES.length + 1 : ''}".strip,
    username: "#{username_seed}_#{index + 1}",
    address: "#{100 + index} Traveler Residency, Sector #{(index % 9) + 1}, #{city_label}, India",
    password: PASSWORD,
    phone: format("70000000%02d", index + 1),
    role: :user
  )
end

puts "Creating cities and stations..."
city_station_data = [
  {
    city: { name: "Mumbai", state: "Maharashtra", country: "India" },
    stations: [
      { name: "Mumbai Central", code: "BCT", latitude: 18.9697, longitude: 72.8194 },
      { name: "Lokmanya Tilak Terminus", code: "LTT", latitude: 19.0677, longitude: 72.8890 }
    ]
  },
  {
    city: { name: "Surat", state: "Gujarat", country: "India" },
    stations: [
      { name: "Surat Junction", code: "ST", latitude: 21.2049, longitude: 72.8406 }
    ]
  },
  {
    city: { name: "Vadodara", state: "Gujarat", country: "India" },
    stations: [
      { name: "Vadodara Junction", code: "BRC", latitude: 22.3072, longitude: 73.1812 }
    ]
  },
  {
    city: { name: "Ahmedabad", state: "Gujarat", country: "India" },
    stations: [
      { name: "Ahmedabad Junction", code: "ADI", latitude: 23.0225, longitude: 72.5714 }
    ]
  },
  {
    city: { name: "Jaipur", state: "Rajasthan", country: "India" },
    stations: [
      { name: "Jaipur Junction", code: "JP", latitude: 26.9124, longitude: 75.7873 }
    ]
  },
  {
    city: { name: "Kota", state: "Rajasthan", country: "India" },
    stations: [
      { name: "Kota Junction", code: "KOTA", latitude: 25.2138, longitude: 75.8648 }
    ]
  },
  {
    city: { name: "Delhi", state: "Delhi", country: "India" },
    stations: [
      { name: "New Delhi", code: "NDLS", latitude: 28.6430, longitude: 77.2194 },
      { name: "Hazrat Nizamuddin", code: "NZM", latitude: 28.5880, longitude: 77.2530 }
    ]
  },
  {
    city: { name: "Agra", state: "Uttar Pradesh", country: "India" },
    stations: [
      { name: "Agra Cantt", code: "AGC", latitude: 27.1577, longitude: 77.9910 }
    ]
  },
  {
    city: { name: "Bhopal", state: "Madhya Pradesh", country: "India" },
    stations: [
      { name: "Bhopal Junction", code: "BPL", latitude: 23.2599, longitude: 77.4126 }
    ]
  },
  {
    city: { name: "Itarsi", state: "Madhya Pradesh", country: "India" },
    stations: [
      { name: "Itarsi Junction", code: "ET", latitude: 22.6110, longitude: 77.7622 }
    ]
  },
  {
    city: { name: "Nagpur", state: "Maharashtra", country: "India" },
    stations: [
      { name: "Nagpur Junction", code: "NGP", latitude: 21.1458, longitude: 79.0882 }
    ]
  },
  {
    city: { name: "Hyderabad", state: "Telangana", country: "India" },
    stations: [
      { name: "Secunderabad Junction", code: "SC", latitude: 17.4399, longitude: 78.4983 }
    ]
  },
  {
    city: { name: "Warangal", state: "Telangana", country: "India" },
    stations: [
      { name: "Warangal", code: "WL", latitude: 17.9784, longitude: 79.5941 }
    ]
  },
  {
    city: { name: "Vijayawada", state: "Andhra Pradesh", country: "India" },
    stations: [
      { name: "Vijayawada Junction", code: "BZA", latitude: 16.5062, longitude: 80.6480 }
    ]
  },
  {
    city: { name: "Gudur", state: "Andhra Pradesh", country: "India" },
    stations: [
      { name: "Gudur Junction", code: "GDR", latitude: 14.1463, longitude: 79.8504 }
    ]
  },
  {
    city: { name: "Chennai", state: "Tamil Nadu", country: "India" },
    stations: [
      { name: "Chennai Central", code: "MAS", latitude: 13.0827, longitude: 80.2707 }
    ]
  },
  {
    city: { name: "Pune", state: "Maharashtra", country: "India" },
    stations: [
      { name: "Pune Junction", code: "PUNE", latitude: 18.5286, longitude: 73.8743 }
    ]
  },
  {
    city: { name: "Solapur", state: "Maharashtra", country: "India" },
    stations: [
      { name: "Solapur", code: "SUR", latitude: 17.6599, longitude: 75.9064 }
    ]
  },
  {
    city: { name: "Nashik", state: "Maharashtra", country: "India" },
    stations: [
      { name: "Nashik Road", code: "NK", latitude: 19.9513, longitude: 73.8347 }
    ]
  },
  {
    city: { name: "Bengaluru", state: "Karnataka", country: "India" },
    stations: [
      { name: "KSR Bengaluru", code: "SBC", latitude: 12.9784, longitude: 77.5714 }
    ]
  }
]

stations_by_code = {}

city_station_data.each do |entry|
  city = City.create!(entry[:city])

  entry[:stations].each do |station_attributes|
    station = city.stations.create!(station_attributes)
    stations_by_code[station.code] = station
  end
end

puts "Creating trains, routes, coaches, seats, fare rules, and schedules..."
train_blueprints = [
  {
    number: "12951",
    name: "Mumbai Ahmedabad Intercity",
    train_type: "superfast",
    rating: 4.5,
    grade: "Premium",
    route: [
      build_stop(code: "BCT", departure_time: "06:00", distance_km: 0),
      build_stop(code: "ST", arrival_time: "08:45", departure_time: "08:50", distance_km: 263),
      build_stop(code: "BRC", arrival_time: "10:15", departure_time: "10:20", distance_km: 392),
      build_stop(code: "ADI", arrival_time: "12:10", distance_km: 492)
    ]
  },
  {
    number: "12952",
    name: "Ahmedabad Mumbai Intercity",
    train_type: "superfast",
    rating: 4.5,
    grade: "Premium",
    route: [
      build_stop(code: "ADI", departure_time: "06:20", distance_km: 0),
      build_stop(code: "BRC", arrival_time: "08:10", departure_time: "08:15", distance_km: 100),
      build_stop(code: "ST", arrival_time: "09:40", departure_time: "09:45", distance_km: 229),
      build_stop(code: "BCT", arrival_time: "12:25", distance_km: 492)
    ]
  },
  {
    number: "12931",
    name: "Ahmedabad Delhi Day Express",
    train_type: "express",
    rating: 4.4,
    grade: "Premier",
    route: [
      build_stop(code: "ADI", departure_time: "05:50", distance_km: 0),
      build_stop(code: "BRC", arrival_time: "07:40", departure_time: "07:45", distance_km: 100),
      build_stop(code: "KOTA", arrival_time: "14:30", departure_time: "14:35", distance_km: 641),
      build_stop(code: "NDLS", arrival_time: "19:55", distance_km: 1156)
    ]
  },
  {
    number: "12932",
    name: "Delhi Ahmedabad Day Express",
    train_type: "express",
    rating: 4.4,
    grade: "Premier",
    route: [
      build_stop(code: "NDLS", departure_time: "06:05", distance_km: 0),
      build_stop(code: "KOTA", arrival_time: "10:20", departure_time: "10:25", distance_km: 458),
      build_stop(code: "BRC", arrival_time: "18:10", departure_time: "18:15", distance_km: 1056),
      build_stop(code: "ADI", arrival_time: "20:00", distance_km: 1156)
    ]
  },
  {
    number: "12621",
    name: "Chennai Hyderabad Intercity",
    train_type: "superfast",
    rating: 4.2,
    grade: "Business",
    route: [
      build_stop(code: "MAS", departure_time: "06:10", distance_km: 0),
      build_stop(code: "GDR", arrival_time: "08:10", departure_time: "08:15", distance_km: 137),
      build_stop(code: "BZA", arrival_time: "12:25", departure_time: "12:35", distance_km: 431),
      build_stop(code: "SC", arrival_time: "17:40", distance_km: 716)
    ]
  },
  {
    number: "12622",
    name: "Hyderabad Chennai Intercity",
    train_type: "superfast",
    rating: 4.2,
    grade: "Business",
    route: [
      build_stop(code: "SC", departure_time: "06:00", distance_km: 0),
      build_stop(code: "BZA", arrival_time: "11:10", departure_time: "11:20", distance_km: 281),
      build_stop(code: "GDR", arrival_time: "15:25", departure_time: "15:30", distance_km: 579),
      build_stop(code: "MAS", arrival_time: "17:35", distance_km: 716)
    ]
  },
  {
    number: "12701",
    name: "LTT Delhi Express",
    train_type: "express",
    rating: 4.1,
    grade: "Classic",
    route: [
      build_stop(code: "LTT", departure_time: "05:30", distance_km: 0),
      build_stop(code: "NK", arrival_time: "09:00", departure_time: "09:05", distance_km: 171),
      build_stop(code: "ET", arrival_time: "13:20", departure_time: "13:25", distance_km: 705),
      build_stop(code: "BPL", arrival_time: "14:40", departure_time: "14:50", distance_km: 793),
      build_stop(code: "NDLS", arrival_time: "22:45", distance_km: 1544)
    ]
  },
  {
    number: "12702",
    name: "Delhi LTT Express",
    train_type: "express",
    rating: 4.1,
    grade: "Classic",
    route: [
      build_stop(code: "NDLS", departure_time: "05:45", distance_km: 0),
      build_stop(code: "BPL", arrival_time: "13:55", departure_time: "14:05", distance_km: 751),
      build_stop(code: "ET", arrival_time: "15:20", departure_time: "15:25", distance_km: 839),
      build_stop(code: "NK", arrival_time: "19:35", departure_time: "19:40", distance_km: 1373),
      build_stop(code: "LTT", arrival_time: "22:55", distance_km: 1544)
    ]
  },
  {
    number: "12723",
    name: "Nagpur Hyderabad Express",
    train_type: "express",
    rating: 4.0,
    grade: "Business",
    route: [
      build_stop(code: "NGP", departure_time: "06:20", distance_km: 0),
      build_stop(code: "WL", arrival_time: "11:45", departure_time: "11:50", distance_km: 420),
      build_stop(code: "SC", arrival_time: "15:05", distance_km: 548)
    ]
  },
  {
    number: "12724",
    name: "Hyderabad Nagpur Express",
    train_type: "express",
    rating: 4.0,
    grade: "Business",
    route: [
      build_stop(code: "SC", departure_time: "06:15", distance_km: 0),
      build_stop(code: "WL", arrival_time: "09:30", departure_time: "09:35", distance_km: 128),
      build_stop(code: "NGP", arrival_time: "15:00", distance_km: 548)
    ]
  },
  {
    number: "12111",
    name: "Mumbai Bengaluru Day Express",
    train_type: "express",
    rating: 4.1,
    grade: "Business",
    route: [
      build_stop(code: "BCT", departure_time: "05:45", distance_km: 0),
      build_stop(code: "PUNE", arrival_time: "09:20", departure_time: "09:30", distance_km: 192),
      build_stop(code: "SUR", arrival_time: "13:50", departure_time: "13:55", distance_km: 455),
      build_stop(code: "SBC", arrival_time: "20:05", distance_km: 982)
    ]
  },
  {
    number: "12112",
    name: "Bengaluru Mumbai Day Express",
    train_type: "express",
    rating: 4.1,
    grade: "Business",
    route: [
      build_stop(code: "SBC", departure_time: "05:50", distance_km: 0),
      build_stop(code: "SUR", arrival_time: "11:55", departure_time: "12:00", distance_km: 527),
      build_stop(code: "PUNE", arrival_time: "16:15", departure_time: "16:25", distance_km: 790),
      build_stop(code: "BCT", arrival_time: "19:55", distance_km: 982)
    ]
  },
  {
    number: "12961",
    name: "Mumbai Jaipur Capital",
    train_type: "superfast",
    rating: 4.3,
    grade: "Premium",
    route: [
      build_stop(code: "BCT", departure_time: "06:25", distance_km: 0),
      build_stop(code: "BRC", arrival_time: "10:20", departure_time: "10:25", distance_km: 392),
      build_stop(code: "KOTA", arrival_time: "16:20", departure_time: "16:25", distance_km: 933),
      build_stop(code: "JP", arrival_time: "19:40", distance_km: 1182)
    ]
  },
  {
    number: "12962",
    name: "Jaipur Mumbai Capital",
    train_type: "superfast",
    rating: 4.3,
    grade: "Premium",
    route: [
      build_stop(code: "JP", departure_time: "06:05", distance_km: 0),
      build_stop(code: "KOTA", arrival_time: "09:20", departure_time: "09:25", distance_km: 249),
      build_stop(code: "BRC", arrival_time: "15:20", departure_time: "15:25", distance_km: 790),
      build_stop(code: "BCT", arrival_time: "19:10", distance_km: 1182)
    ]
  },
  {
    number: "12271",
    name: "Chennai Delhi Connector",
    train_type: "superfast",
    rating: 4.4,
    grade: "Premier",
    route: [
      build_stop(code: "MAS", departure_time: "04:45", distance_km: 0),
      build_stop(code: "BZA", arrival_time: "09:20", departure_time: "09:30", distance_km: 431),
      build_stop(code: "SC", arrival_time: "14:20", departure_time: "14:30", distance_km: 716),
      build_stop(code: "BPL", arrival_time: "20:35", departure_time: "20:45", distance_km: 1505),
      build_stop(code: "NZM", arrival_time: "23:55", distance_km: 1750)
    ]
  },
  {
    number: "12272",
    name: "Delhi Chennai Connector",
    train_type: "superfast",
    rating: 4.4,
    grade: "Premier",
    route: [
      build_stop(code: "NZM", departure_time: "05:30", distance_km: 0),
      build_stop(code: "BPL", arrival_time: "08:40", departure_time: "08:50", distance_km: 245),
      build_stop(code: "SC", arrival_time: "15:05", departure_time: "15:15", distance_km: 1034),
      build_stop(code: "BZA", arrival_time: "20:05", departure_time: "20:15", distance_km: 1319),
      build_stop(code: "MAS", arrival_time: "23:50", distance_km: 1750)
    ]
  }
]

coach_templates = [
  { coach_type: "sleeper", prefix: "S" },
  { coach_type: "1ac", prefix: "H" },
  { coach_type: "2ac", prefix: "C" }
]

train_blueprints.each_with_index do |blueprint, index|
  train = Train.create!(
    train_number: blueprint[:number],
    name: blueprint[:name],
    train_type: blueprint[:train_type],
    rating: blueprint[:rating],
    grade: blueprint[:grade],
    is_active: true
  )

  saved_stops = blueprint[:route].each_with_index.map do |stop_blueprint, stop_index|
    train_stop = TrainStop.new(
      train: train,
      station: stations_by_code.fetch(stop_blueprint[:code]),
      stop_order: stop_index + 1,
      arrival_at: stop_datetime(stop_blueprint[:arrival_day], stop_blueprint[:arrival_time]),
      departure_at: stop_datetime(stop_blueprint[:departure_day], stop_blueprint[:departure_time]),
      distance_from_origin_km: stop_blueprint[:distance_km]
    )
    train_stop.sync_time_columns_from_datetimes
    train_stop.save!
    train_stop
  end

  coach_templates.each_with_index do |coach_template, coach_index|
    coach = Coach.create!(
      train: train,
      coach_number: "#{coach_template[:prefix]}#{coach_index + 1}",
      coach_type: coach_template[:coach_type]
    )
    CoachSeatLayoutSync.new(coach: coach).call

    FareRule.create!(
      train: train,
      coach_type: coach_template[:coach_type],
      base_fare_per_km: case coach_template[:coach_type]
                        when "sleeper" then 1.2 + (index * 0.03)
                        when "1ac" then 2.6 + (index * 0.04)
                        when "2ac" then 1.85 + (index * 0.03)
                        else 1.5 + (index * 0.03)
                        end.round(2),
      dynamic_multiplier: (1.0 + ((index % 3) * 0.05)).round(2),
      valid_from: Date.current,
      valid_to: Date.current + 1.year
    )
  end

  origin_stop = saved_stops.find(&:departure_time)
  destination_stop = saved_stops.reverse.find(&:arrival_time)

  SCHEDULE_DAYS.times do |day_offset|
    travel_date = Date.current + day_offset

    Schedule.create!(
      train: train,
      travel_date: travel_date,
      departure_time: origin_stop.departure_time,
      expected_arrival_time: destination_stop.arrival_time,
      status: "scheduled",
      delay_minutes: [0, 5, 10, 0, 0][day_offset % 5]
    )
  end
end

puts "Seeding complete."
puts "Admins: #{User.admin.count}"
puts "Users: #{User.user.count}"
puts "Cities: #{City.count}"
puts "Stations: #{Station.count}"
puts "Trains: #{Train.count}"
puts "Schedules: #{Schedule.count}"
puts "Common UI search routes for the next #{SCHEDULE_DAYS} days:"
COMMON_SEARCH_ROUTES.each do |from_code, to_code|
  from_station = stations_by_code.fetch(from_code)
  to_station = stations_by_code.fetch(to_code)

  puts "- #{from_station.name} (#{from_station.code}) -> #{to_station.name} (#{to_station.code})"
end
puts "Recommended travel dates to test:"
puts "- #{Date.current}"
puts "- #{Date.current + 1}"
puts "- #{Date.current + 2}"
