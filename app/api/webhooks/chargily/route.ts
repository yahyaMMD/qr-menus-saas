import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@chargily/chargily-pay';
import prisma from '@/lib/prisma';
import { 
  sendEmail, 
  getSubscriptionConfirmedEmailTemplate, 
  getPaymentReceiptEmailTemplate 
} from '@/lib/email';
import {
  notifySubscriptionActivated,
  notifyPaymentSuccess,
  notifyPaymentFailed
} from '@/lib/notifications';

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

    if (payment && payment.userId && payment.user) {
      const plan = checkout.metadata?.plan as any;
      const priceCents = checkout.metadata?.priceCents || checkout.amount;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
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
            expiresAt,
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
            expiresAt,
            active: true,
            paymentRef: checkout.id,
            priceCents: priceCents,
            currency: 'DZD'
          }
        });
      }

      console.log(`Subscription activated for user ${payment.userId} with plan ${plan}`);

      // Send confirmation emails
      const user = payment.user;
      const priceFormatted = (priceCents / 100).toFixed(0);
      const planFeatures = getPlanFeatures(plan);
      
      // Send subscription confirmation email
      const subscriptionEmail = getSubscriptionConfirmedEmailTemplate({
        name: user.name,
        plan: plan,
        price: priceFormatted,
        currency: 'DA',
        expiresAt: expiresAt.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        features: planFeatures,
      });
      
      sendEmail({
        to: user.email,
        subject: subscriptionEmail.subject,
        html: subscriptionEmail.html,
      }).catch(err => console.error('Failed to send subscription email:', err));

      // Send payment receipt email
      const receiptEmail = getPaymentReceiptEmailTemplate({
        name: user.name,
        amount: priceFormatted,
        currency: 'DA',
        plan: plan,
        paymentDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        paymentMethod: checkout.payment_method === 'edahabia' ? 'EDAHABIA' : 'CIB',
        invoiceNumber: checkout.id.substring(0, 8).toUpperCase(),
        periodStart: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        periodEnd: expiresAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });
      
      sendEmail({
        to: user.email,
        subject: receiptEmail.subject,
        html: receiptEmail.html,
      }).catch(err => console.error('Failed to send receipt email:', err));

      // Create notifications (non-blocking)
      notifySubscriptionActivated(
        user.id,
        plan,
        priceFormatted,
        'DA'
      ).catch(err => console.error('Failed to create subscription notification:', err));

      notifyPaymentSuccess(
        user.id,
        priceFormatted,
        'DA',
        plan
      ).catch(err => console.error('Failed to create payment notification:', err));
    }

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

// Helper to get plan features for emails
function getPlanFeatures(plan: string): string[] {
  const features: Record<string, string[]> = {
    STANDARD: [
      '3 Restaurant Profiles',
      '3 Digital Menus per profile',
      'Custom QR Codes',
      'Up to 50 menu items',
      '100 QR scans per day',
      'Advanced Analytics',
      'Priority Email Support',
    ],
    CUSTOM: [
      'Unlimited Restaurant Profiles',
      'Unlimited Digital Menus',
      'Premium QR Codes with Analytics',
      'Unlimited menu items',
      'Unlimited QR scans',
      'Real-time Analytics & Reports',
      '24/7 Priority Support',
      'White-label Solution',
    ],
    FREE: [
      '1 Restaurant Profile',
      '1 Digital Menu',
      'Basic QR Code',
      'Up to 10 menu items',
    ],
  };
  return features[plan] || features.FREE;
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