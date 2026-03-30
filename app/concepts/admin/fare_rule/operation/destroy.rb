module Admin
  module FareRule
    module Operation
      class Destroy < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :destroy_model

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
