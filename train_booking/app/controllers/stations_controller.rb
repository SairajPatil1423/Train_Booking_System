# StationsController provides station search data for the user flow.
class StationsController < ApplicationController
  def index
    result = Station::Operation::Index.run(params: params)
    render_result(result)
  end
end
