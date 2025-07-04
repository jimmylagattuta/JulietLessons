class Subscription < ApplicationRecord
  belongs_to :user

  validates :status, inclusion: { in: %w[active canceled trialing] }
end
