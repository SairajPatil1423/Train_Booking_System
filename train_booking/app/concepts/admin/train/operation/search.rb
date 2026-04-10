module Admin::Train::Operation
  class Search < Trailblazer::Operation
    step :authorize!
    step :validate_params!
    step :build_scope
    step :apply_filters!
    step :paginate!
    step :serialize!
    fail :handle_errors

    def authorize!(ctx, current_user:, **)
      return false unless current_user&.admin?
      true
    end

    def validate_params!(ctx, params:, **)
      train_name = params[:train_name].to_s.strip
      train_number = params[:train_number].to_s.strip

      unless train_name.present? || train_number.present?
        ctx[:errors] = ['At least one search parameter is required']
        return false
      end

      ctx[:search_params] = {
        train_name: train_name.presence,
        train_number: train_number.presence
      }
      true
    end

    def build_scope(ctx, **)
      ctx[:scope] = ::Train.order(:train_number)
    end

    def apply_filters!(ctx, **)
      search = ctx[:search_params]

      if search[:train_name].present?
        ctx[:scope] = ctx[:scope].where("name ILIKE ?", "%#{search[:train_name]}%")
      end

      if search[:train_number].present?
        ctx[:scope] = ctx[:scope].where("train_number ILIKE ?", "%#{search[:train_number]}%")
      end

      true
    end

    def paginate!(ctx, params:, **)
      page = [(params[:page] || 1).to_i, 1].max
      per_page = [(params[:per_page] || 10).to_i, 100].min

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
        data: records,
        meta: {
          current_page: ctx[:current_page],
          total_pages: ctx[:total_pages],
          total_count: ctx[:total_count]
        }
      }
    end

    def handle_errors(ctx, **)
      ctx[:errors] ||= ['Search operation failed']
    end
  end
end
