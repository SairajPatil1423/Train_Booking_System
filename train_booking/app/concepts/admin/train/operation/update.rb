module Admin
  module Train
    module Operation
      class Update < Trailblazer::Operation
        step :validate_authorization, Output(:failure) => Track(:failure)
        step :find_model, Output(:failure) => Track(:failure)
        step :validate_uniqueness, Output(:failure) => Track(:failure)
        step :update_model, Output(:failure) => Track(:failure)
        step :serialize_result, Output(:failure) => Track(:failure)
        fail :normalize_failure

        def validate_authorization(ctx, current_user:, **)
          return false unless current_user && current_user.admin?
          true
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::Train.find_by(id: id)
          if ctx[:model].nil?
            ctx[:error] = 'Train not found'
            return false
          end
          true
        end

        def validate_uniqueness(ctx, params:, model:, **)
          if params[:train_number].present? && params[:train_number] != model.train_number
            if ::Train.exists?(train_number: params[:train_number])
              ctx[:error] = "Train number #{params[:train_number]} already exists"
              return false
            end
          end
          true
        end

        def update_model(ctx, params:, model:, **)
          update_attrs = {}
          update_attrs[:train_number] = params[:train_number] if params.key?(:train_number)
          update_attrs[:name] = params[:name] if params.key?(:name)
          update_attrs[:train_type] = params[:train_type] if params.key?(:train_type)
          update_attrs[:rating] = params[:rating] if params.key?(:rating)
          update_attrs[:grade] = params[:grade] if params.key?(:grade)
          update_attrs[:is_active] = params[:is_active] if params.key?(:is_active)

          model.update!(update_attrs)
          true
        rescue StandardError => e
          ctx[:error] = e.message
          false
        end

        def serialize_result(ctx, model:, **)
          ctx[:model] = { message: 'Train updated successfully', train: model }
          true
        end

        def normalize_failure(ctx, **)
          ctx[:errors] = Array(ctx[:errors] || ctx[:error] || "Operation failed")
        end
      end
    end
  end
end
