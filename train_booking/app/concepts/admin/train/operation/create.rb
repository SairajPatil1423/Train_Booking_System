module Admin
  module Train
    module Operation
      class Create < Trailblazer::Operation
        step :validate_authorization
        step :validate_presence
        step :validate_uniqueness
        step :persist

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def validate_presence(ctx, params:, **)
          if params[:train_number].blank? || params[:name].blank? || params[:train_type].blank?
            ctx[:errors] = ['train_number, name, and train_type cannot be blank']
            return false
          end
          true
        end

        def validate_uniqueness(ctx, params:, **)
          if ::Train.exists?(train_number: params[:train_number])
            ctx[:errors] = ["Train number #{params[:train_number]} already exists"]
            return false
          end
          true
        end

        def persist(ctx, params:, **)
          ctx[:model] = ::Train.create!(
            train_number: params[:train_number],
            name: params[:name],
            train_type: params[:train_type],
            rating: params[:rating],
            grade: params[:grade],
            is_active: params.fetch(:is_active, true)
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
