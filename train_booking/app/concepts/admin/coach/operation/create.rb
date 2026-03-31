module Admin
  module Coach
    module Operation
      class Create < Trailblazer::Operation
        step :validate_authorization
        step :validate_presence
        step :validate_train_exists
        step :validate_no_duplicate_coach
        step :persist_coach_and_seats

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def validate_presence(ctx, params:, **)
          required = %i[train_id coach_number coach_type total_seats]
          missing = required.select { |f| params[f].blank? }
          if missing.any?
            ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
            return false
          end
          if params[:total_seats].to_i <= 0
            ctx[:errors] = ['total_seats must be a positive integer']
            return false
          end
          true
        end

        def validate_train_exists(ctx, params:, **)
          unless ::Train.exists?(id: params[:train_id])
            ctx[:errors] = ["Train #{params[:train_id]} not found"]
            return false
          end
          true
        end

        def validate_no_duplicate_coach(ctx, params:, **)
          if ::Coach.exists?(train_id: params[:train_id], coach_number: params[:coach_number])
            ctx[:errors] = ["Coach #{params[:coach_number]} already exists for this train"]
            return false
          end
          true
        end

        def persist_coach_and_seats(ctx, params:, **)
          ActiveRecord::Base.transaction do
            coach = ::Coach.create!(
              train_id: params[:train_id],
              coach_number: params[:coach_number],
              coach_type: params[:coach_type],
              total_seats: params[:total_seats].to_i
            )

            seat_type = params[:seat_type] || default_seat_type(params[:coach_type])
            params[:total_seats].to_i.times do |i|
              ::Seat.create!(
                coach_id: coach.id,
                seat_number: format('%02d', i + 1),
                seat_type: seat_type,
                is_active: true
              )
            end

            ctx[:model] = coach.reload
          end
          true
        rescue StandardError => e
          ctx[:errors] = [e.message]
          false
        end

        private

        def default_seat_type(coach_type)
          case coach_type.to_s.downcase
          when 'sleeper'    then 'berth'
          when 'first class' then 'cabin'
          else 'seat'
          end
        end
      end
    end
  end
end
