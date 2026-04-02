PASSWORD = "password123".freeze
SCHEDULE_DAYS = 21
COMMON_SEARCH_ROUTES = [
  ["BCT", "ADI"],
  ["ADI", "BCT"],
  ["ADI", "NDLS"],
  ["NDLS", "ADI"],
  ["MAS", "SC"],
  ["SC", "MAS"],
  ["LTT", "NDLS"],
  ["NDLS", "LTT"],
  ["BCT", "SC"],
  ["SC", "BCT"],
  ["BCT", "BRC"],
  ["BRC", "NDLS"],
  ["MAS", "BZA"],
  ["BPL", "NDLS"],
  ["NGP", "SC"],
  ["JP", "ADI"],
  ["BZA", "MAS"]
].freeze

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
2.times do |index|
  User.create!(
    email: "admin#{index + 1}@trainbooking.com",
    full_name: "Admin Operator #{index + 1}",
    username: "admin_ops_#{index + 1}",
    address: "Rail Operations HQ #{index + 1}, Central Admin Block, New Delhi, India",
    password: PASSWORD,
    phone: format("90000000%02d", index + 1),
    role: :admin
  )
end

puts "Creating regular users..."
40.times do |index|
  User.create!(
    email: "user#{index + 1}@trainbooking.com",
    full_name: "Passenger #{index + 1}",
    username: "traveler_#{index + 1}",
    address: "#{100 + index} Passenger Residency, Sector #{(index % 9) + 1}, Mumbai, India",
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
    city: { name: "Vijayawada", state: "Andhra Pradesh", country: "India" },
    stations: [
      { name: "Vijayawada Junction", code: "BZA", latitude: 16.5062, longitude: 80.6480 }
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
    name: "Western Capital Express",
    train_type: "Superfast",
    rating: 4.6,
    grade: "Premium",
    route: [
      ["BCT", nil, "06:00", 0],
      ["ST", "08:15", "08:20", 265],
      ["BRC", "09:45", "09:50", 392],
      ["ADI", "11:30", nil, 492]
    ]
  },
  {
    number: "12952",
    name: "Western Capital Return",
    train_type: "Superfast",
    rating: 4.5,
    grade: "Premium",
    route: [
      ["ADI", nil, "06:10", 0],
      ["BRC", "07:45", "07:50", 100],
      ["ST", "09:20", "09:25", 227],
      ["BCT", "11:45", nil, 492]
    ]
  },
  {
    number: "12953",
    name: "Rajputana Arrow",
    train_type: "Express",
    rating: 4.4,
    grade: "Premier",
    route: [
      ["ADI", nil, "05:45", 0],
      ["JP", "11:40", "11:50", 660],
      ["NDLS", "17:30", nil, 935]
    ]
  },
  {
    number: "12954",
    name: "Rajputana Arrow Return",
    train_type: "Express",
    rating: 4.3,
    grade: "Premier",
    route: [
      ["NDLS", nil, "05:30", 0],
      ["JP", "11:10", "11:20", 275],
      ["ADI", "17:10", nil, 935]
    ]
  },
  {
    number: "12621",
    name: "Dakshin Link",
    train_type: "Superfast",
    rating: 4.2,
    grade: "Business",
    route: [
      ["MAS", nil, "06:20", 0],
      ["BZA", "11:00", "11:10", 431],
      ["SC", "16:45", nil, 716]
    ]
  },
  {
    number: "12622",
    name: "Dakshin Link Return",
    train_type: "Superfast",
    rating: 4.1,
    grade: "Business",
    route: [
      ["SC", nil, "06:10", 0],
      ["BZA", "11:25", "11:35", 285],
      ["MAS", "16:15", nil, 716]
    ]
  },
  {
    number: "12701",
    name: "Central Crown",
    train_type: "Express",
    rating: 4.0,
    grade: "Classic",
    route: [
      ["LTT", nil, "07:00", 0],
      ["BPL", "14:15", "14:25", 779],
      ["NDLS", "23:10", nil, 1544]
    ]
  },
  {
    number: "12702",
    name: "Central Crown Return",
    train_type: "Express",
    rating: 4.0,
    grade: "Classic",
    route: [
      ["NDLS", nil, "07:15", 0],
      ["BPL", "15:50", "16:00", 765],
      ["LTT", "23:45", nil, 1544]
    ]
  },
  {
    number: "12811",
    name: "Deccan Meridian",
    train_type: "Mail",
    rating: 3.9,
    grade: "Saver",
    route: [
      ["BCT", nil, "05:50", 0],
      ["NGP", "16:10", "16:20", 837],
      ["SC", "23:55", nil, 1385]
    ]
  },
  {
    number: "12812",
    name: "Deccan Meridian Return",
    train_type: "Mail",
    rating: 3.9,
    grade: "Saver",
    route: [
      ["SC", nil, "05:40", 0],
      ["NGP", "13:00", "13:10", 548],
      ["BCT", "23:15", nil, 1385]
    ]
  },
  {
    number: "12111",
    name: "Western Deccan Link",
    train_type: "Express",
    rating: 4.1,
    grade: "Business",
    route: [
      ["BCT", nil, "06:30", 0],
      ["PUNE", "10:10", "10:20", 192],
      ["SBC", "20:15", nil, 982]
    ]
  },
  {
    number: "12112",
    name: "Western Deccan Return",
    train_type: "Express",
    rating: 4.1,
    grade: "Business",
    route: [
      ["SBC", nil, "06:10", 0],
      ["PUNE", "15:50", "16:00", 790],
      ["BCT", "20:05", nil, 982]
    ]
  },
  {
    number: "12651",
    name: "Southern Capital Connector",
    train_type: "Superfast",
    rating: 4.3,
    grade: "Premium",
    route: [
      ["MAS", nil, "05:55", 0],
      ["BZA", "10:40", "10:50", 431],
      ["SC", "15:50", "16:00", 716],
      ["NDLS", "08:10", nil, 2175]
    ]
  },
  {
    number: "12652",
    name: "Southern Capital Return",
    train_type: "Superfast",
    rating: 4.2,
    grade: "Premium",
    route: [
      ["NDLS", nil, "06:00", 0],
      ["SC", "22:25", "22:35", 1459],
      ["BZA", "03:10", "03:20", 1744],
      ["MAS", "08:05", nil, 2175]
    ]
  },
  {
    number: "12961",
    name: "Capital Corridor",
    train_type: "Express",
    rating: 4.2,
    grade: "Premier",
    route: [
      ["BCT", nil, "07:15", 0],
      ["BRC", "09:40", "09:50", 392],
      ["JP", "18:10", "18:20", 1052],
      ["NDLS", "23:40", nil, 1327]
    ]
  },
  {
    number: "12962",
    name: "Capital Corridor Return",
    train_type: "Express",
    rating: 4.2,
    grade: "Premier",
    route: [
      ["NDLS", nil, "06:50", 0],
      ["JP", "12:10", "12:20", 275],
      ["BRC", "20:30", "20:40", 935],
      ["BCT", "23:05", nil, 1327]
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

  blueprint[:route].each_with_index do |(station_code, arrival_time, departure_time, distance_km), stop_index|
    TrainStop.create!(
      train: train,
      station: stations_by_code.fetch(station_code),
      stop_order: stop_index + 1,
      arrival_time: arrival_time,
      departure_time: departure_time,
      distance_from_origin_km: distance_km
    )
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

  departure_time = blueprint[:route].first[2]
  arrival_time = blueprint[:route].last[1]

  SCHEDULE_DAYS.times do |day_offset|
    travel_date = Date.current + day_offset

    Schedule.create!(
      train: train,
      travel_date: travel_date,
      departure_time: departure_time,
      expected_arrival_time: arrival_time,
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
