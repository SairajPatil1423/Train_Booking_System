module Admin
  module Coach
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :normalize_coach_type
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

        def normalize_coach_type(ctx, params:, **)
          return true unless params.key?(:coach_type)

          normalized_type = params[:coach_type].to_s.strip.downcase
          unless ::Coach::COACH_LAYOUTS.key?(normalized_type)
            ctx[:errors] = ["coach_type must be one of: #{::Coach::COACH_LAYOUTS.keys.join(', ')}"]
            return false
          end

          params[:coach_type] = normalized_type
          true
        end

        def update_model(ctx, params:, model:, **)
          coach_type_changed = params.key?(:coach_type) && params[:coach_type] != model.coach_type

          if coach_type_changed && model.seats.joins(:ticket_allocations).exists?
            ctx[:errors] = ['Cannot change coach_type after seat allocations exist for this coach']
            return false
          end

          update_attrs = {}
          update_attrs[:coach_type]   = params[:coach_type]   if params.key?(:coach_type)
          model.update!(update_attrs)
          ::CoachSeatLayoutSync.new(coach: model).call if coach_type_changed || model.seats.empty?
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
