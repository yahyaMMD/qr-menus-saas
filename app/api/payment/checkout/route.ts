import { NextRequest, NextResponse } from 'next/server';
import { chargilyClient } from '@/lib/chargily';
import { authenticateRequest } from '@/lib/auth/middleware';
import prisma from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user from JWT token (reads from httpOnly cookies or Authorization header)
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.payload) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth failed:', authResult.error);
      }
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = authResult.payload.userId;
    const userEmail = authResult.payload.email;

    const { plan, paymentMethod } = await request.json();

    // Validate input
    if (!plan || !paymentMethod) {
      return NextResponse.json(
        { error: 'Plan and payment method are required' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['edahabia', 'cib'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Get user from database using ID from headers
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          where: {
            status: 'ACTIVE'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get plan details from catalog
    const planCatalog = await prisma.planCatalog.findUnique({
      where: { plan }
    });

    if (!planCatalog) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

      // Check if it's a free plan
      if (plan === 'FREE') {
        // For free plan, create subscription directly without payment
        // First find existing subscription or create new
        const existingSubscription = await prisma.subscription.findFirst({
          where: { userId: user.id },
          orderBy: { id: 'desc' }
        });      let subscription;
      if (existingSubscription) {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            plan: 'FREE',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            active: true,
            priceCents: 0,
            currency: 'DZD'
          }
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'FREE',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            active: true,
            priceCents: 0,
            currency: 'DZD'
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Free plan activated successfully',
        subscription,
        isFreePlan: true
      });
    }

    // For paid plans, proceed with Chargily payment
    try {
      let customer;
      try {
        // Try to find existing customer by email
        const customers = await chargilyClient.listCustomers(10); // Increased limit for search
        const existingCustomer = customers.data.find(c => c.email === user.email);
        
        if (existingCustomer) {
          customer = existingCustomer;
        } else {
          // Create new customer
          customer = await chargilyClient.createCustomer({
            name: user.name,
            email: user.email,
            address: {
              country: 'DZ',
              state: 'Algiers',
              address: user.profiles[0]?.location ? JSON.stringify(user.profiles[0].location) : 'N/A'
            },
            metadata: {
              userId: user.id,
              internalId: user.id
            }
          });
        }
      } catch (error) {
        console.warn('Warning: Could not create/find Chargily customer (continuing):', error);
        // Continue without customer - Chargily will create one automatically
      }

      // Create a product for the subscription plan
      const product = await chargilyClient.createProduct({
        name: `${plan} Subscription Plan`,
        description: `Monthly subscription to ${plan} plan - Digital Menu Service`,
        images: [],
        metadata: {
          type: 'subscription',
          plan: plan,
          userId: user.id
        }
      });

      // Create price for the product
      const price = await chargilyClient.createPrice({
        amount: planCatalog.priceCents,
        currency: 'dzd',
        product_id: product.id,
        metadata: {
          plan: plan,
          billingPeriod: 'monthly'
        }
      });

      // Generate unique success URL with additional parameters
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        request.nextUrl.origin;
      const successUrl = new URL(`${baseUrl}/payment/success`);
      successUrl.searchParams.set('session_id', '{checkout_id}');
      successUrl.searchParams.set('plan', plan);
      successUrl.searchParams.set('amount', planCatalog.priceCents.toString());

      // Create checkout session
      const checkout = await chargilyClient.createCheckout({
        items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        success_url: successUrl.toString(),
        failure_url: `${process.env.NEXTAUTH_URL}/payment/failed?plan=${plan}`,
        payment_method: paymentMethod,
        customer_id: customer?.id,
        locale: 'en',
        pass_fees_to_customer: false,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          plan: plan,
          priceCents: planCatalog.priceCents,
          productId: product.id,
          priceId: price.id,
          type: 'subscription'
        }
      });

      // Create pending payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amountCents: planCatalog.priceCents,
          currency: 'DZD',
          status: 'PENDING',
          reference: checkout.id
        }
      });

      // Create pending subscription record - find existing or create new
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { id: 'desc' }
      });

      let subscription;
      if (existingSubscription) {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            plan: plan as any,
            status: 'PAUSED' as SubscriptionStatus, // Pending payment - will be activated by webhook
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days placeholder until webhook confirms
            active: false,
            paymentRef: checkout.id,
            priceCents: planCatalog.priceCents,
            currency: 'DZD'
          }
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: plan as any,
            status: 'PAUSED' as SubscriptionStatus, // Pending payment - will be activated by webhook
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // placeholder until webhook confirms
            active: false,
            paymentRef: checkout.id,
            priceCents: planCatalog.priceCents,
            currency: 'DZD'
          }
        });
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: checkout.checkout_url,
        checkoutId: checkout.id,
        paymentId: payment.id,
        amount: planCatalog.priceCents,
        currency: 'DZD',
        isFreePlan: false
      });
    } catch (chargilyError) {
      console.error('Chargily API error:', chargilyError);
      return NextResponse.json(
        { error: 'Failed to create payment session with Chargily. Please check your API credentials.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Checkout creation error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
