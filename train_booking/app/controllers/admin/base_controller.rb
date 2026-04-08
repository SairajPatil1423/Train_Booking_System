class Admin::BaseController < ApplicationController
  before_action :authenticate_user!

  private

  def merged_params(permitted_hash = {})
    permitted_hash.merge(current_user: current_user)
  end

  def paginated_params(*extra_keys)
    params.permit(:page, :per_page, *extra_keys).to_h.symbolize_keys
  end

  def id_params
    params.permit(:id).to_h.symbolize_keys
  end

  def permitted_resource_params(resource_key, *keys, **nested)
    source = params[resource_key].is_a?(ActionController::Parameters) ? params.require(resource_key) : params
    source.permit(*keys, **nested).to_h.deep_symbolize_keys
  end
end
