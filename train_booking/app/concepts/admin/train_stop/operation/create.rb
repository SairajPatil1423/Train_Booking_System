module Admin
  module TrainStop
    module Operation
      class Create < Trailblazer::Operation
        step :validate_authorization
        step :validate_presence
        step :validate_train_exists
        step :validate_station_exists
        step :validate_no_duplicate_order
        step :validate_no_duplicate_station
        step :persist

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def validate_presence(ctx, params:, **)
          required = %i[train_id station_id stop_order distance_from_origin_km]
          missing = required.select { |f| params[f].blank? }
          if missing.any?
            ctx[:errors] = ["Missing required fields: #{missing.join(', ')}"]
            return false
          end
          true
        end

        def validate_train_exists(ctx, params:, **)
          unless ::Train.exists?(id: params[:train_id])
            ctx[:errors] = ["Train with id #{params[:train_id]} not found"]
            return false
          end
          true
        end

        def validate_station_exists(ctx, params:, **)
          unless ::Station.exists?(id: params[:station_id])
            ctx[:errors] = ["Station with id #{params[:station_id]} not found"]
            return false
          end
          true
        end

        def validate_no_duplicate_order(ctx, params:, **)
          if ::TrainStop.exists?(train_id: params[:train_id], stop_order: params[:stop_order])
            ctx[:errors] = ["Stop order #{params[:stop_order]} already exists for this train"]
            return false
          end
          true
        end

        def validate_no_duplicate_station(ctx, params:, **)
          if ::TrainStop.exists?(train_id: params[:train_id], station_id: params[:station_id])
            ctx[:errors] = ["This station is already a stop on this train"]
            return false
          end
          true
        end

        def persist(ctx, params:, **)
          ctx[:model] = ::TrainStop.create!(
            train_id: params[:train_id],
            station_id: params[:station_id],
            stop_order: params[:stop_order],
            arrival_time: params[:arrival_time],
            departure_time: params[:departure_time],
            distance_from_origin_km: params[:distance_from_origin_km]
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
