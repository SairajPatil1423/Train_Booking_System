module Booking::Operation
  class Index < Trailblazer::Operation
    step :fetch_scope
    step :paginate!
    step :serialize!

    def fetch_scope(ctx, current_user:, params:, **)
      scope = Booking.where(user_id: current_user.id)
      
      if ActiveModel::Type::Boolean.new.cast(params[:with_cancellations])
        scope = scope.joins(:cancellations).distinct
      end

      ctx[:scope] = scope.includes(
        :payment,
        :passengers,
        :src_station,
        :dst_station,
        :cancellations,
        { ticket_allocations: :seat },
        { schedule: :train }
      ).order(booked_at: :desc)
    end

    def paginate!(ctx, params:, **)
      page = [(params[:page] || 1).to_i, 1].max
      per_page = [(params[:per_page] || 20).to_i, 100].min
      
      ctx[:records] = Paginatable::PaginatedCollection.new(
        ctx[:scope],
        current_page: page,
        per_page: per_page
      )
      
      ctx[:current_page] = ctx[:records].current_page
      ctx[:total_pages] = ctx[:records].total_pages
      ctx[:total_count] = ctx[:records].total_count
    end

    def serialize!(ctx, **)
      data = ctx[:records].as_json(include: {
        schedule: {
          include: { train: { only: %i[id train_number name train_type] } }
        },
        src_station: { only: %i[id name code] },
        dst_station: { only: %i[id name code] },
        passengers: {},
        ticket_allocations: {
          include: { seat: { only: %i[id seat_number seat_type coach_id] } }
        },
        payment: {},
        cancellations: {}
      })

      ctx[:model] = {
        data: data,
        meta: {
          current_page: ctx[:current_page],
          total_pages: ctx[:total_pages],
          total_count: ctx[:total_count]
        }
      }
    end
  end
end
