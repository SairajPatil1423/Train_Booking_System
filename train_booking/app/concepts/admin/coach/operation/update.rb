module Admin
  module Coach
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :update_model

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::Coach.find_by(id: id)
          if ctx[:model].nil?
            ctx[:errors] = ['Coach not found']
            return false
          end
          true
        end

        def update_model(ctx, params:, model:, **)
          update_attrs = {}
          update_attrs[:coach_type]   = params[:coach_type]   if params.key?(:coach_type)
          update_attrs[:total_seats]  = params[:total_seats]  if params.key?(:total_seats)
          model.update!(update_attrs)
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
