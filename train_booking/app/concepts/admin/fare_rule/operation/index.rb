module Admin::FareRule::Operation
  class Index < Trailblazer::Operation
    step :authorize!
    step :fetch_scope
    step :paginate!
    step :serialize!

    def authorize!(ctx, current_user:, **)
      current_user&.admin?
    end

    def fetch_scope(ctx, **)
      ctx[:scope] = ::FareRule.includes(:train).order(valid_from: :desc)
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
        data: records.as_json(include: :train),
        meta: {
          current_page: ctx[:current_page],
          total_pages: ctx[:total_pages],
          total_count: ctx[:total_count]
        }
      }
    end
  end
end
