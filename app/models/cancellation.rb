class Cancellation < ApplicationRecord
  belongs_to :booking
  belongs_to :ticket_allocation
  belongs_to :requested_by
end
