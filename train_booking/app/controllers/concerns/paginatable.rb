module Paginatable
  extend ActiveSupport::Concern

  DEFAULT_PER_PAGE = 10
  MAX_PER_PAGE = 50

  private

  class PaginatedCollection
    include Enumerable

    attr_reader :current_page, :limit_value, :total_pages, :total_count

    def initialize(scope, current_page:, per_page:)
      @total_count = scope.count
      @limit_value = per_page
      @total_pages = @total_count.zero? ? 1 : (@total_count.to_f / per_page).ceil
      @current_page = [[current_page, 1].max, @total_pages].min
      @relation = scope.offset((@current_page - 1) * per_page).limit(per_page)
    end

    def each(&block)
      @relation.each(&block)
    end

    def as_json(*args)
      @relation.as_json(*args)
    end

    def method_missing(method_name, *args, &block)
      return @relation.public_send(method_name, *args, &block) if @relation.respond_to?(method_name)

      super
    end

    def respond_to_missing?(method_name, include_private = false)
      @relation.respond_to?(method_name, include_private) || super
    end
  end

  def page_param
    requested_page = params[:page].to_i
    requested_page.positive? ? requested_page : 1
  end

  def per_page_param
    requested_per_page = params[:per_page].to_i
    normalized_per_page = requested_per_page.positive? ? requested_per_page : DEFAULT_PER_PAGE

    [normalized_per_page, MAX_PER_PAGE].min
  end

  def paginate_scope(scope)
    PaginatedCollection.new(
      scope,
      current_page: page_param,
      per_page: per_page_param
    )
  end

  def pagination_meta(records)
    {
      current_page: records.current_page,
      per_page: records.limit_value,
      total_pages: records.total_pages,
      total_count: records.total_count
    }
  end

  def paginated_response(data:, records:)
    {
      data: data,
      meta: pagination_meta(records)
    }
  end
end
