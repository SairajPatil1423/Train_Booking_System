module Admin
  module Schedule
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :update_model
        step :serialize_result

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::Schedule.find_by(id: id)
          if ctx[:model].nil?
            ctx[:errors] = ['Schedule not found']
            return false
          end
          true
        end

        def update_model(ctx, params:, model:, **)
          allowed = %i[departure_time expected_arrival_time status delay_minutes]
          update_attrs = params.slice(*allowed).reject { |_, v| v.nil? }
          model.update!(update_attrs)
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end

        def serialize_result(ctx, model:, **)
          ctx[:model] = { message: 'Schedule updated', schedule: model }
          true
        end
      end
    end
  end
end
