module Refund
  module Operation
    class Calculate < Trailblazer::Operation
      step :validate_inputs
      step :calculate_refund
      fail :collect_errors

      def validate_inputs(ctx, amount:, schedule:, **)
        if amount.to_d.negative?
          ctx[:errors] = ["Refund amount cannot be negative"]
          return false
        end

        if schedule.blank?
          ctx[:errors] = ["Schedule is required for refund calculation"]
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

      def collect_errors(ctx, model: nil, **)
        ctx[:errors] ||= model&.errors&.full_messages.presence || ['Operation failed']
      end

      private

      def hours_until_departure(schedule)
        departure_at = departure_time_for(schedule)
        ((departure_at - Time.zone.now) / 1.hour).floor
      end

      def departure_time_for(schedule)
        date = schedule.travel_date
        time = schedule.departure_time

        hours = time.hour
        minutes = time.min
        seconds = time.sec

        Time.zone.local(date.year, date.month, date.day, hours, minutes, seconds)
      end
    end
  end
end
