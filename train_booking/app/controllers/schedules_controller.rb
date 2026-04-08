# SchedulesController handles public search and authenticated booking details.
class SchedulesController < ApplicationController
  before_action :authenticate_user!, only: :show

  def index
    result = Schedule::Operation::Index.run(params: params)
    render_result(result)
  end

  def show
    result = Schedule::Operation::Show.run(params: params.merge(current_user: current_user))
    render_result(result)
  end

end

