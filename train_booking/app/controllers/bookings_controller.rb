# BookingsController handles user booking APIs.
class BookingsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_booking, only: %i[show update cancel_ticket]

  def index
    bookings_scope = policy_scope(Booking)
    bookings_scope = bookings_scope.joins(:cancellations).distinct if with_cancellations?
    bookings_scope = bookings_scope
      .includes(
        :payment,
        :passengers,
        :src_station,
        :dst_station,
        :cancellations,
        { ticket_allocations: :seat },
        { schedule: :train }
      )
      .order(booked_at: :desc)

    authorize Booking

    bookings = paginate_scope(bookings_scope)
    serialized_bookings = bookings.as_json(include: booking_includes)

    render json: paginated_response(data: serialized_bookings, records: bookings), status: :ok
  end

  def show
    authorize @booking
    render json: { booking: @booking.as_json(include: booking_includes) }, status: :ok
  end

  def create
    authorize Booking

    result = run Booking::Operation::Create,
                 current_user: current_user,
                 params: booking_params.to_h.deep_symbolize_keys.merge(user_id: current_user.id) do |operation_result|
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

  def update
    authorize @booking, :cancel?

    result = run Booking::Operation::Cancel,
                 current_user: current_user,
                 params: { booking_id: @booking.id, reason: cancellation_params[:reason] } do |operation_result|
      render json: {
        message: "Booking cancelled successfully.",
        booking: operation_result[:booking].as_json(include: booking_includes),
        refund_amount: operation_result[:refund_amount]
      }, status: :ok
    end

    return if performed?

    render json: { errors: Array(result[:error] || result[:errors]) }, status: :unprocessable_entity
  end

  def cancel_ticket
    authorize @booking, :cancel?

    result = run Booking::Operation::CancelTicket,
                 current_user: current_user,
                 params: {
                   booking_id: @booking.id,
                   ticket_allocation_id: cancel_ticket_params[:ticket_allocation_id],
                   reason: cancel_ticket_params[:reason]
                 } do |operation_result|
      render json: {
        message: "Ticket cancelled successfully.",
        booking: operation_result[:booking].as_json(include: booking_includes),
        refund_amount: operation_result[:refund_amount]
      }, status: :ok
    end

    return if performed?

    render json: { errors: Array(result[:error] || result[:errors]) }, status: :unprocessable_entity
  end

  private

  def set_booking
    @booking = policy_scope(Booking).find(params[:id])
  end

  def booking_params
    params.require(:booking).permit(
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

  def cancellation_params
    params.fetch(:booking, ActionController::Parameters.new).permit(:reason)
  end

  def cancel_ticket_params
    params.require(:booking).permit(:ticket_allocation_id, :reason)
  end

  def booking_includes
    {
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

  def with_cancellations?
    ActiveModel::Type::Boolean.new.cast(params[:with_cancellations])
  end
end
