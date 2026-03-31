module Admin
  module City
    module Operation
      class Destroy < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :check_dependencies
        step :destroy_model

        def validate_authorization(ctx, current_user:, **)
          current_user&.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::City.find_by(id: id)
          return true if ctx[:model]

          ctx[:errors] = ["City not found"]
          false
        end

        def check_dependencies(ctx, model:, **)
          return true unless model.stations.exists?

          ctx[:errors] = ["Cannot delete city with associated stations"]
          false
        end

        def destroy_model(ctx, model:, **)
          model.destroy!
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end
      end
    end
  end
end
