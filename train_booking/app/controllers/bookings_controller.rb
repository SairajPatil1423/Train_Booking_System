# BookingsController handles user booking APIs.
class BookingsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_booking, only: %i[show]

  def index
    result = Booking::Operation::Index.run(params: index_params.merge(current_user: current_user))
    render_result(result)
  end

  def show
    result = Booking::Operation::Show.run(params: show_params.merge(current_user: current_user))
    render_result(result)
  end

  def create
    result = Booking::Operation::Create.run(params: booking_create_params.merge(current_user: current_user))
    render_result(result)
  end

  def update
    result = Booking::Operation::Cancel.run(params: cancel_params.merge(current_user: current_user))
    render_result(result)
  end

  def cancel_ticket
    result = Booking::Operation::CancelTicket.run(params: cancel_ticket_params.merge(current_user: current_user))
    render_result(result)
  end

  private

  def index_params
    params.permit(:page, :per_page, :with_cancellations).to_h.symbolize_keys
  end

  def show_params
    params.permit(:id).to_h.symbolize_keys
  end

  def booking_create_params
    booking_params_source.permit(
      :user_id,
      :schedule_id,
      :src_station_id,
      :dst_station_id,
      :coach_type,
      :seat_id,
      seat_ids: [],
      passengers: %i[first_name last_name age gender id_type id_number],
      payment: %i[payment_method gateway_txn_id]
    ).to_h.deep_symbolize_keys.merge(user_id: current_user.id)
  end

  def cancel_params
    cancel_params_source.permit(:reason).to_h.symbolize_keys.merge(
      booking_id: params[:id] || params[:booking_id]
    )
  end

  def cancel_ticket_params
    cancel_params_source.permit(:ticket_allocation_id, :reason).to_h.symbolize_keys.merge(
      booking_id: params[:id] || params[:booking_id]
    )
  end

  def booking_params_source
    params[:booking].is_a?(ActionController::Parameters) ? params.require(:booking) : params
  end

  def cancel_params_source
    params[:booking].is_a?(ActionController::Parameters) ? params.require(:booking) : params
  end
end
