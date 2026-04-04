class Admin::BookingsController < Admin::BaseController
  def index
    authorize Booking
    bookings_scope = policy_scope(Booking)
      .includes(
        :user,
        :passengers,
        :payment,
        :src_station,
        :dst_station,
        :cancellations,
        { ticket_allocations: :seat },
        { schedule: :train }
      )
      .order(booked_at: :desc)

    bookings = paginate_scope(bookings_scope)

    render json: paginated_response(
      data: bookings.as_json(include: booking_includes),
      records: bookings
    ), status: :ok
  end

  private

  def booking_includes
    {
      user: { only: %i[id email phone role] },
      schedule: {
        include: {
          train: { only: %i[id train_number name train_type] }
        }
      },
      src_station: { only: %i[id name code] },
      dst_station: { only: %i[id name code] },
      passengers: {},
      ticket_allocations: {
        include: {
          seat: { only: %i[id seat_number seat_type coach_id] }
        }
      },
      payment: {},
      cancellations: {}
    }
  end
end
