module Admin
  module FareRule
    module Operation
      class Create < Trailblazer::Operation
        step :validate_authorization
        step :validate_presence
        step :normalize_coach_type
        step :validate_valid_to_greater_than_from
        step :validate_no_overlap
        step :persist

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def validate_presence(ctx, params:, **)
          required = %i[train_id coach_type base_fare_per_km valid_from valid_to]
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

        def validate_valid_to_greater_than_from(ctx, params:, **)
          if Date.parse(params[:valid_to].to_s) < Date.parse(params[:valid_from].to_s)
            ctx[:errors] = ['valid_to date cannot be earlier than valid_from date']
            return false
          end
          true
        rescue ArgumentError
          ctx[:errors] = ['Invalid date format']
          false
        end

        def validate_no_overlap(ctx, params:, **)
         
          overlapping = ::FareRule.where(train_id: params[:train_id], coach_type: params[:coach_type])
                                  .where('valid_from <= ? AND valid_to >= ?', params[:valid_to], params[:valid_from])
          
          if overlapping.exists?
            ctx[:errors] = ['A FareRule already exists for this train and coach type during the specified date range.']
            return false
          end
          true
        end

        def persist(ctx, params:, **)
          ctx[:model] = ::FareRule.create!(
            train_id: params[:train_id],
            coach_type: params[:coach_type],
            base_fare_per_km: params[:base_fare_per_km],
            dynamic_multiplier: params.fetch(:dynamic_multiplier, 1.0),
            valid_from: params[:valid_from],
            valid_to: params[:valid_to]
          )
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
