module Admin
  module Coach
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :normalize_params
        step :normalize_coach_type
        step :validate_train_exists
        step :validate_no_duplicate_coach
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

        def normalize_params(_ctx, params:, **)
          params[:coach_number] = params[:coach_number].to_s.strip if params.key?(:coach_number)
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

        def validate_train_exists(ctx, params:, model:, **)
          train_id = params.key?(:train_id) ? params[:train_id] : model.train_id

          unless ::Train.exists?(id: train_id)
            ctx[:errors] = ["Train #{train_id} not found"]
            return false
          end

          true
        end

        def validate_no_duplicate_coach(ctx, params:, model:, **)
          target_train_id = params.key?(:train_id) ? params[:train_id] : model.train_id
          target_coach_number = params.key?(:coach_number) ? params[:coach_number] : model.coach_number

          duplicate_exists = ::Coach.where(train_id: target_train_id, coach_number: target_coach_number)
                                    .where.not(id: model.id)
                                    .exists?

          if duplicate_exists
            ctx[:errors] = ["Coach #{target_coach_number} already exists for this train"]
            return false
          end

          true
        end

        def update_model(ctx, params:, model:, **)
          target_train_id = params.key?(:train_id) ? params[:train_id] : model.train_id
          coach_number_changed = params.key?(:coach_number) && params[:coach_number] != model.coach_number
          train_changed = params.key?(:train_id) && params[:train_id] != model.train_id
          coach_type_changed = params.key?(:coach_type) && params[:coach_type] != model.coach_type
          has_allocations = model.seats.joins(:ticket_allocations).exists?

          if coach_type_changed && has_allocations
            ctx[:errors] = ['Cannot change coach_type after seat allocations exist for this coach']
            return false
          end

          if train_changed && has_allocations
            ctx[:errors] = ['Cannot move a coach to another train after seat allocations exist for this coach']
            return false
          end

          update_attrs = {}
          update_attrs[:train_id] = target_train_id if train_changed
          update_attrs[:coach_number] = params[:coach_number] if coach_number_changed
          update_attrs[:coach_type] = params[:coach_type] if coach_type_changed

          model.update!(update_attrs)
          ::CoachSeatLayoutSync.new(coach: model).call if coach_type_changed || model.seats.empty?
          ctx[:model] = model.reload
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
