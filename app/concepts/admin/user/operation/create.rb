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
          if params[:email].blank? || params[:password].blank?
            ctx[:errors] = ['Email and password cannot be blank']
            return false
          end
          true
        end

        def validate_uniqueness(ctx, params:, **)
          if ::User.exists?(email: params[:email])
            ctx[:errors] = ["Email #{params[:email]} is already registered"]
            return false
          end
          true
        end

        def persist(ctx, params:, **)
          
          ctx[:model] = ::User.create!(
            email: params[:email],
            password: params[:password],
            phone: params[:phone],
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
