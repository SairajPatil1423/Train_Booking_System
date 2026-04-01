module Admin
  module Coach
    module Operation
      class Create < Trailblazer::Operation
        step :validate_authorization
        step :validate_presence
        step :normalize_coach_type
        step :validate_train_exists
        step :validate_no_duplicate_coach
        step :persist_coach_and_seats

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def validate_presence(ctx, params:, **)
          required = %i[train_id coach_number coach_type]
          missing = required.select { |f| params[f].blank? }
          if missing.any?
            ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
            return false
          end
          true
        end

        def normalize_coach_type(ctx, params:, **)
          normalized_type = params[:coach_type].to_s.strip.downcase

          unless ::Coach::COACH_LAYOUTS.key?(normalized_type)
            ctx[:errors] = ["coach_type must be one of: #{::Coach::COACH_LAYOUTS.keys.join(', ')}"]
            return false
          end

          params[:coach_type] = normalized_type
          true
        end

        def validate_train_exists(ctx, params:, **)
          unless ::Train.exists?(id: params[:train_id])
            ctx[:errors] = ["Train #{params[:train_id]} not found"]
            return false
          end
          true
        end

        def validate_no_duplicate_coach(ctx, params:, **)
          if ::Coach.exists?(train_id: params[:train_id], coach_number: params[:coach_number])
            ctx[:errors] = ["Coach #{params[:coach_number]} already exists for this train"]
            return false
          end
          true
        end

        def persist_coach_and_seats(ctx, params:, **)
          ActiveRecord::Base.transaction do
            coach = ::Coach.create!(
              train_id: params[:train_id],
              coach_number: params[:coach_number],
              coach_type: params[:coach_type]
            )

            ::CoachSeatLayoutSync.new(coach: coach).call

            ctx[:model] = coach.reload
          end
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
