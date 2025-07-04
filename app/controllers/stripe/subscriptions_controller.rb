module Stripe
  class SubscriptionsController < ApplicationController
    def show
      subscription = Subscription.find_by(user_id: params[:id])

      if subscription
        render json: subscription
      else
        render json: { error: "Subscription not found" }, status: :not_found
      end
    end

    def create
      user = User.find(params[:user_id])

      # TODO: Create Stripe customer + subscription here via Stripe API
      stripe_customer = Stripe::Customer.create(email: user.email)
      stripe_subscription = Stripe::Subscription.create({
        customer: stripe_customer.id,
        items: [{ price: 'your_price_id_here' }],
      })

      subscription = Subscription.create!(
        user: user,
        status: 'active',
        stripe_customer_id: stripe_customer.id,
        stripe_subscription_id: stripe_subscription.id,
        total_spent_on_lessons: 0
      )

      render json: subscription, status: :created
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
