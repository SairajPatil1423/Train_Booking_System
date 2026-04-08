module Admin::TrainStop::Operation
  class Index < Trailblazer::Operation
    step :authorize!
    step :fetch_scope
    step :paginate!
    step :serialize!

    def authorize!(ctx, current_user:, **)
      current_user&.admin?
    end

    def fetch_scope(ctx, **)
      ctx[:scope] = ::TrainStop.includes(:train, :station).order(:train_id, :stop_order)
    end

    def paginate!(ctx, params:, **)
      page = [(params[:page] || 1).to_i, 1].max
      per_page = [[(params[:per_page] || 20).to_i, 1].max, 100].min

      ctx[:records] = Paginatable::PaginatedCollection.new(
        ctx[:scope],
        current_page: page,
        per_page: per_page
      )
      ctx[:current_page] = ctx[:records].current_page
      ctx[:total_pages] = ctx[:records].total_pages
      ctx[:total_count] = ctx[:records].total_count
    end

    def serialize!(ctx, records:, **)
      ctx[:model] = {
        data: records.map { |stop| serialize_train_stop(stop) },
        meta: {
          current_page: ctx[:current_page],
          total_pages: ctx[:total_pages],
          total_count: ctx[:total_count]
        }
      }
    end

    private

    def serialize_train_stop(train_stop)
      train_stop.as_json(include: {
        train: { only: %i[id train_number name train_type] },
        station: {
          only: %i[id name code],
          include: {
            city: { only: %i[id name state country] }
          }
        }
      }).merge(
        arrival_at: train_stop.arrival_at,
        departure_at: train_stop.departure_at
      )
    end
  end
end
