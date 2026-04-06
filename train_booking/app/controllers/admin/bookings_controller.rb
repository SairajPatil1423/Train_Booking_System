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

  def show
    booking = policy_scope(Booking)
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
      .find(params[:id])

    authorize booking

    render json: { booking: booking.as_json(include: booking_includes) }, status: :ok
  end

  def create
    authorize Booking, :admin_create?

    result = run Booking::Operation::Create,
                 current_user: current_user,
                 params: booking_params.to_h.deep_symbolize_keys do |operation_result|
      render json: {
        message: "Booking confirmed successfully.",
        booking: operation_result[:booking].as_json(include: booking_includes),
        fare_per_seat: operation_result[:fare_per_seat],
        total_fare: operation_result[:total_fare]
      }, status: :created
    end

    return if performed?

    render json: { errors: Array(result[:error] || result[:errors]) }, status: :unprocessable_entity
  end

  private

  def booking_params
    params.require(:booking).permit(
      :user_id,
      :schedule_id,
      :src_station_id,
      :dst_station_id,
      :seat_id,
      :coach_type,
      seat_ids: [],
      payment: [:payment_method, :gateway_txn_id],
      passengers: [:first_name, :last_name, :age, :gender, :id_type, :id_number]
    )
  end

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
