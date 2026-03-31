module Admin
  module FareRule
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :validate_valid_to_greater_than_from
        step :validate_no_overlap
        step :update_model

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::FareRule.find_by(id: id)
          if ctx[:model].nil?
            ctx[:errors] = ['FareRule not found']
            return false
          end
          true
        end

        def validate_valid_to_greater_than_from(ctx, params:, model:, **)
          v_from = params[:valid_from] || model.valid_from
          v_to = params[:valid_to] || model.valid_to

          if Date.parse(v_to.to_s) < Date.parse(v_from.to_s)
            ctx[:errors] = ['valid_to date cannot be earlier than valid_from date']
            return false
          end
          true
        rescue ArgumentError
          ctx[:errors] = ['Invalid date format']
          false
        end

        def validate_no_overlap(ctx, params:, model:, **)
          t_id = params[:train_id] || model.train_id
          c_type = params[:coach_type] || model.coach_type
          v_from = params[:valid_from] || model.valid_from
          v_to = params[:valid_to] || model.valid_to

          overlapping = ::FareRule.where(train_id: t_id, coach_type: c_type)
                                  .where.not(id: model.id)
                                  .where('valid_from <= ? AND valid_to >= ?', v_to, v_from)
          
          if overlapping.exists?
            ctx[:errors] = ['A FareRule already exists for this train and coach type during the specified date range.']
            return false
          end
          true
        end

        def update_model(ctx, params:, model:, **)
          update_attrs = {}
          update_attrs[:train_id] = params[:train_id] if params.key?(:train_id)
          update_attrs[:coach_type] = params[:coach_type] if params.key?(:coach_type)
          update_attrs[:base_fare_per_km] = params[:base_fare_per_km] if params.key?(:base_fare_per_km)
          update_attrs[:dynamic_multiplier] = params[:dynamic_multiplier] if params.key?(:dynamic_multiplier)
          update_attrs[:valid_from] = params[:valid_from] if params.key?(:valid_from)
          update_attrs[:valid_to] = params[:valid_to] if params.key?(:valid_to)

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
