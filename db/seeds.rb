puts "Cleaning up database..."
# Order of deletion is important to avoid foreign key constraint violations
TicketAllocation.destroy_all
Passenger.destroy_all
Payment.destroy_all
Cancellation.destroy_all
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

puts "Creating Admin and Users..."
admin = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  phone: '1234567890',
  role: 'admin'
)

user = User.create!(
  email: 'user@example.com',
  password: 'password123',
  phone: '0987654321',
  role: 'user'
)

puts "Creating Cities and Stations..."
city_shanghai = City.create!(name: 'Shanghai', state: 'Shanghai', country: 'China')
city_beijing = City.create!(name: 'Beijing', state: 'Beijing', country: 'China')
city_nanjing = City.create!(name: 'Nanjing', state: 'Jiangsu', country: 'China')

station_shq = Station.create!(city: city_shanghai, name: 'Shanghai Hongqiao', code: 'SHQ', latitude: 31.1923, longitude: 121.3149)
station_njn = Station.create!(city: city_nanjing, name: 'Nanjing South', code: 'NJN', latitude: 31.9688, longitude: 118.7905)
station_bjn = Station.create!(city: city_beijing, name: 'Beijing South', code: 'BJN', latitude: 39.8643, longitude: 116.3788)

puts "Creating Train..."
train = Train.create!(
  train_number: 'G1',
  name: 'Fuxing Express',
  train_type: 'High Speed',
  is_active: true
)

puts "Creating Train Stops..."
TrainStop.create!(
  train: train,
  station: station_shq,
  stop_order: 1,
  arrival_time: nil,
  departure_time: '09:00:00',
  distance_from_origin_km: 0
)

TrainStop.create!(
  train: train,
  station: station_njn,
  stop_order: 2,
  arrival_time: '10:15:00',
  departure_time: '10:20:00',
  distance_from_origin_km: 300
)

TrainStop.create!(
  train: train,
  station: station_bjn,
  stop_order: 3,
  arrival_time: '13:30:00',
  departure_time: nil,
  distance_from_origin_km: 1318
)

puts "Creating Coaches and Seats..."
['Business', 'First Class', 'Second Class'].each_with_index do |type, i|
  coach = Coach.create!(
    train: train,
    coach_number: "C#{i + 1}",
    coach_type: type,
    total_seats: 10
  )

  1.upto(10) do |seat_num|
    Seat.create!(
      coach: coach,
      seat_number: "#{seat_num}#{['A', 'B', 'C', 'D', 'F'].sample}",
      seat_type: 'Window',
      is_active: true
    )
  end
end

puts "Creating Fare Rules..."
FareRule.create!(
  train: train,
  coach_type: 'Second Class',
  base_fare_per_km: 0.45,
  dynamic_multiplier: 1.0,
  valid_from: Date.today,
  valid_to: Date.today + 1.year
)

FareRule.create!(
  train: train,
  coach_type: 'First Class',
  base_fare_per_km: 0.75,
  dynamic_multiplier: 1.0,
  valid_from: Date.today,
  valid_to: Date.today + 1.year
)

puts "Creating Schedules..."
(Date.today..Date.today + 7.days).each do |date|
  Schedule.create!(
    train: train,
    travel_date: date,
    departure_time: '09:00:00',
    expected_arrival_time: '13:30:00',
    status: 'scheduled',
    delay_minutes: 0
  )
end

puts "Database successfully seeded! 🌱"
