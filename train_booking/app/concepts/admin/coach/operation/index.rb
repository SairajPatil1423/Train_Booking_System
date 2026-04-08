module Admin::Coach::Operation
  class Index < Trailblazer::Operation
    step :authorize!
    step :fetch_scope
    step :paginate!
    step :serialize!

    def authorize!(ctx, current_user:, **)
      current_user&.admin?
    end

    def fetch_scope(ctx, **)
      ctx[:scope] = ::Coach.includes(:train, :seats).order(:train_id, :coach_number)
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
        data: records.map { |coach| serialize_coach(coach) },
        meta: {
          current_page: ctx[:current_page],
          total_pages: ctx[:total_pages],
          total_count: ctx[:total_count]
        }
      }
    end

    private

    def serialize_coach(coach)
      coach.as_json(
        only: %i[id train_id coach_number total_seats],
        include: {
          train: { only: %i[id train_number name] },
          seats: { only: %i[id seat_number seat_type is_active] }
        }
      ).merge(coach_type: coach.api_coach_type)
    end
  end
end
