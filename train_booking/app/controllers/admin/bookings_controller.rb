class Admin::BookingsController < Admin::BaseController
  def index
    if search_requested?
      result = Admin::Booking::Operation::Search.run(params: search_params.merge(current_user: current_user))
    else
      result = Admin::Booking::Operation::Index.run(params: index_params.merge(current_user: current_user))
    end
    render_result(result)
  end

  def show
    result = Admin::Booking::Operation::Show.run(params: show_params.merge(current_user: current_user))
    render_result(result)
  end

  def create
    result = Booking::Operation::Create.run(params: booking_create_params.merge(current_user: current_user))
    render_result(result)
  end

  private

  def index_params
    params.permit(:page, :per_page, :with_cancellations).to_h.symbolize_keys
  end

  def search_params
    params.permit(:page, :per_page, :user_email).to_h.symbolize_keys
  end

  def search_requested?
    params[:user_email].present?
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
    ).to_h.deep_symbolize_keys
  end

  def booking_params_source
    params[:booking].is_a?(ActionController::Parameters) ? params.require(:booking) : params
  end
end
