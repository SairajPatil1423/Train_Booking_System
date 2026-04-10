module Station::Operation
  class Index < Trailblazer::Operation
    step :fetch_scope
    step :paginate!
    step :serialize!
    fail :collect_errors

    def fetch_scope(ctx, **)
      ctx[:scope] = ::Station.includes(:city).order(:name)
    end

    def paginate!(ctx, params:, **)
      page = [(params[:page] || 1).to_i, 1].max
      per_page = [[(params[:per_page] || 10).to_i, 1].max, 50].min

      ctx[:records] = Paginatable::PaginatedCollection.new(
        ctx[:scope],
        current_page: page,
        per_page: per_page
      )
    end

    def serialize!(ctx, records:, **)
      ctx[:model] = {
        data: records.as_json(
          only: %i[id name code],
          include: { city: { only: %i[id name state country] } }
        ),
        meta: {
          current_page: records.current_page,
          per_page: records.limit_value,
          total_pages: records.total_pages,
          total_count: records.total_count
        }
      }
    end

    def collect_errors(ctx, model: nil, **)
      ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
    end
  end
end
