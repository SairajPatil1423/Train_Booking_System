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
          # Prevent deletion if the train has active components (like schedules or stops) 
          # that shouldn't be orphaned in a production system.
          if ::Schedule.exists?(train_id: model.id, status: 'scheduled')
            ctx[:errors] = ['Cannot delete a train with active scheduled trips. You must cancel them first.']
            return false
          end
          true
        end

        def destroy_model(ctx, model:, **)
          # Assuming cascade deletes for FareRules and train stops happen gracefully via models
          # or we just deactivate the train for historic retention. 
          # For testing Admin capabilities, we will truly destroy it or just deactivate it.
          # We'll use actual destroy_all relations or destroy the record directly.
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
