import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@chargily/chargily-pay';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  let event;
  
  try {
    const signature = request.headers.get('signature');
    const payload = await request.text();

    if (!signature) {
      console.error('Missing signature in webhook');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifySignature(
      Buffer.from(payload),
      signature,
      process.env.CHARGILY_API_KEY!
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    event = JSON.parse(payload);
    console.log('Received webhook event:', event.type);

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.paid':
        await handleSuccessfulPayment(event);
        break;
      
      case 'checkout.failed':
        await handleFailedPayment(event);
        break;
      
      case 'checkout.expired':
        await handleExpiredPayment(event);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true, processed: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(event: any) {
  const checkout = event.data;
  
  console.log('Processing successful payment for checkout:', checkout.id);

  try {
    // Update payment status in database
    await prisma.payment.updateMany({
      where: { reference: checkout.id },
      data: { 
        status: 'PAID',
        metadata: {
          ...checkout.metadata,
          webhookReceivedAt: new Date().toISOString(),
          checkoutData: {
            id: checkout.id,
            status: checkout.status,
            amount: checkout.amount,
            currency: checkout.currency
          }
        }
      }
    });

    // Get payment record to find user
    const payment = await prisma.payment.findFirst({
      where: { reference: checkout.id },
      include: {
        user: true
      }
    });

    if (payment && payment.userId) {
      const plan = checkout.metadata?.plan as any;
      const priceCents = checkout.metadata?.priceCents || checkout.amount;
      
      // Update subscription to active
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: payment.userId
        }
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: {
            id: existingSubscription.id
          },
          data: {
            plan: plan,
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            active: true,
            paymentRef: checkout.id,
            priceCents: priceCents,
            currency: 'DZD'
          }
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            plan: plan,
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            active: true,
            paymentRef: checkout.id,
            priceCents: priceCents,
            currency: 'DZD'
          }
        });
      }

      console.log(`Subscription activated for user ${payment.userId} with plan ${plan}`);
    }

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(event: any) {
  const checkout = event.data;
  
  console.log('Processing failed payment for checkout:', checkout.id);

  try {
    await prisma.payment.updateMany({
      where: { reference: checkout.id },
      data: { 
        status: 'FAILED',
        metadata: {
          failureReason: checkout.failure_message || 'Payment failed',
          webhookReceivedAt: new Date().toISOString()
        }
      }
    });

    // Optionally, you can also update the subscription status
    const payment = await prisma.payment.findFirst({
      where: { reference: checkout.id }
    });

    if (payment && payment.subscriptionId) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { 
          active: false,
          status: 'EXPIRED'
        }
      });
    }

  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

async function handleExpiredPayment(event: any) {
  const checkout = event.data;
  
  console.log('Processing expired payment for checkout:', checkout.id);

  try {
    await prisma.payment.updateMany({
      where: { reference: checkout.id },
      data: { 
        status: 'FAILED',
        metadata: {
          failureReason: 'Payment session expired',
          webhookReceivedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error handling expired payment:', error);
    throw error;
  }
}