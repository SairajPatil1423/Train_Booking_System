class Admin::BookingsController < Admin::BaseController
  def index
    authorize Booking
    base_scope = policy_scope(Booking)
    bookings_scope = base_scope
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

    if pagination_requested?
      total_count = base_scope.count
      page = normalized_page
      per_page = normalized_per_page
      total_pages = [(total_count.to_f / per_page).ceil, 1].max
      page = [page, total_pages].min
      offset = (page - 1) * per_page
      bookings = bookings_scope.offset(offset).limit(per_page)

      render json: {
        bookings: bookings.as_json(include: booking_includes),
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }, status: :ok
      return
    end

    render json: { bookings: bookings_scope.as_json(include: booking_includes) }, status: :ok
  end

  private

  def pagination_requested?
    params[:page].present? || params[:per_page].present?
  end

  def normalized_page
    [params[:page].to_i, 1].max
  end

  def normalized_per_page
    requested = params[:per_page].to_i
    requested = 10 if requested <= 0
    [requested, 50].min
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
