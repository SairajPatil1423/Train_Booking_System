module Admin
  module Train
    module Operation
      class Destroy < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :check_dependencies
        step :destroy_model

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::Train.find_by(id: id)
          if ctx[:model].nil?
            ctx[:errors] = ['Train not found']
            return false
          end
          true
        end

        def check_dependencies(ctx, model:, **)
          if ::Schedule.exists?(train_id: model.id, status: 'scheduled')
            ctx[:errors] = ['Cannot delete a train with active scheduled trips. You must cancel them first.']
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
