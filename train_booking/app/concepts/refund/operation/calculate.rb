module Refund
  module Operation
    class Calculate < Trailblazer::Operation
      step :validate_inputs
      step :calculate_refund

      def validate_inputs(ctx, amount:, schedule:, **)
        if amount.to_d.negative?
          ctx[:error] = "Refund amount cannot be negative"
          return false
        end

        if schedule.blank?
          ctx[:error] = "Schedule is required for refund calculation"
          return false
        end

        true
      end

      def calculate_refund(ctx, amount:, schedule:, **)
        refund_ratio =
          case hours_until_departure(schedule)
          when 24..Float::INFINITY then 0.90
          when 6...24              then 0.50
          when 1...6               then 0.25
          else 0.0
          end

        ctx[:refund_ratio] = refund_ratio
        ctx[:refund_amount] = (amount.to_d * refund_ratio).round(2)
        true
      end

      private

      def hours_until_departure(schedule)
        departure_at = Time.zone.parse("#{schedule.travel_date} #{schedule.departure_time}")
        ((departure_at - Time.zone.now) / 1.hour).floor
      end
    end
  end
end
