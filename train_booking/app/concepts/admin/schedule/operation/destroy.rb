module Admin
  module Schedule
    module Operation
      class Destroy < Trailblazer::Operation
        step :validate_authorization
        step :find_model
        step :check_bookings
        step :check_ticket_allocations
        step :destroy_model

        def validate_authorization(ctx, current_user:, **)
          current_user && current_user.admin?
        end

        def find_model(ctx, id:, **)
          ctx[:model] = ::Schedule.find_by(id: id)
          if ctx[:model].nil?
            ctx[:errors] = ['Schedule not found']
            return false
          end
          true
        end

        def check_bookings(ctx, model:, **)
          if ::Booking.where(schedule_id: model.id).exists?
            ctx[:errors] = ['Cannot delete schedule: bookings exist for this schedule']
            return false
          end
          true
        end

        def check_ticket_allocations(ctx, model:, **)
          if ::TicketAllocation.where(schedule_id: model.id).exists?
            ctx[:errors] = ['Cannot delete schedule: ticket allocations exist for this schedule']
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
