class TicketAllocation < ApplicationRecord

  belongs_to :booking
  belongs_to :passenger
  belongs_to :seat

  belongs_to :src_stop, class_name: "TrainStop"
  belongs_to :dst_stop, class_name: "TrainStop"

  validates :booking_id, presence: true
  validates :passenger_id, presence: true
  validates :seat_id, presence: true
  validates :from_stop_id, presence: true
  validates :to_stop_id, presence: true
  validates :status, presence: true

  validate :valid_stop_order
  validate :same_train
  validate :no_overlap_for_same_seat
  validate :match_schedule_train

  def match_schedule_train
    return unless booking&.schedule && src_stop && dst_stop

    train_id = booking.schedule.train_id

    if src_stop.train_id != train_id || dst_stop.train_id != train_id
      errors.add(:base, "Stops do not match schedule train")
    end
  end
  
  def no_overlap_for_same_seat
    return unless seat && from_stop && to_stop

    overlapping = TicketAllocation
      .where(seat_id: seat_id)
      .where.not(id: id)
      .joins(:from_stop, :to_stop)
      .where(
        "NOT (? <= train_stops.stop_order OR ? >= train_stops.stop_order)",
        to_stop.stop_order,
        from_stop.stop_order
      )

    if overlapping.exists?
      errors.add(:seat, "is already booked for overlapping segment")
    end
  end



  def same_train
    return unless src_stop && dst_stop

    if src_stop.train_id != dst_stop.train_id
      errors.add(:base, "Stops must belong to same train")
    end
  end



  def valid_stop_order
    return unless src_stop && dst_stop

    if src_stop.stop_order >= dst_stop.stop_order
      errors.add(:base, "Invalid journey direction")
    end
  end

end