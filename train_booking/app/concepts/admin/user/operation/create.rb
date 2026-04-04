module Admin
  module User
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
          required_fields = %i[email password password_confirmation full_name username address]
          missing_fields = required_fields.select { |field| params[field].blank? }

          if missing_fields.any?
            ctx[:errors] = ["Missing required fields: #{missing_fields.join(', ')}"]
            return false
          end

          if params[:password] != params[:password_confirmation]
            ctx[:errors] = ["Password confirmation does not match"]
            return false
          end

          true
        end

        def validate_uniqueness(ctx, params:, **)
          if ::User.exists?(email: params[:email])
            ctx[:errors] = ["Email #{params[:email]} is already registered"]
            return false
          end

          if ::User.where("LOWER(username) = ?", params[:username].to_s.downcase).exists?
            ctx[:errors] = ["Username #{params[:username]} is already registered"]
            return false
          end

          true
        end

        def persist(ctx, params:, **)
          ctx[:model] = ::User.create!(
            email: params[:email],
            password: params[:password],
            password_confirmation: params[:password_confirmation],
            phone: params[:phone],
            full_name: params[:full_name],
            username: params[:username],
            address: params[:address],
            role: 'admin'
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
