class Admin::BookingsController < Admin::BaseController
  before_action :set_booking, only: :show

  def index
    authorize Booking
    bookings = policy_scope(Booking).includes(:user, :passengers, :ticket_allocations, :payment).order(booked_at: :desc)

    render json: { bookings: bookings.as_json(include: booking_includes) }, status: :ok
  end

  def show
    authorize @booking
    render json: { booking: @booking.as_json(include: booking_includes) }, status: :ok
  end

  private

  def set_booking
    @booking = policy_scope(Booking).find(params[:id])
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
