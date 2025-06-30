# Stripe Integration Guide

## Overview
This guide explains how to integrate Stripe payments with dynamic amounts based on your invoice totals.

## Backend Setup (Node.js/Express Example)

### 1. Install Stripe
```bash
npm install stripe
```

### 2. Create Payment Intent Endpoint
```javascript
// server.js or api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', invoiceId, paymentType } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., $10.00 = 1000)
      currency: currency,
      metadata: {
        invoiceId: invoiceId,
        paymentType: paymentType, // 'deposit', 'full', or 'tip'
      },
      // Optional: Add customer information
      // customer: customerId,
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});
```

### 3. Environment Variables
Create a `.env` file:
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Frontend Integration

### 1. Install Stripe Elements
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Update PaymentButton Component
Replace the commented Stripe code in `PaymentButton.tsx` with:

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

const handlePayment = async () => {
  setLoading(true);
  
  try {
    let paymentAmount = amount;
    
    if (variant === 'tip') {
      const tip = parseFloat(tipAmount);
      if (isNaN(tip) || tip <= 0) {
        alert('Please enter a valid tip amount');
        setLoading(false);
        return;
      }
      paymentAmount = tip;
    }

    // Create payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(paymentAmount * 100), // Convert to cents
        currency: 'usd',
        invoiceId: invoiceId,
        paymentType: variant
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret } = await response.json();
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Redirect to Stripe Checkout or use Elements
    const result = await stripe.redirectToCheckout({
      sessionId: clientSecret, // If using Checkout Sessions
    });

    // OR use confirmCardPayment with Elements
    // const result = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: {
    //     card: elements.getElement(CardElement)!,
    //     billing_details: {
    //       name: 'Customer Name',
    //     },
    //   }
    // });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Payment succeeded
    alert(`Payment of $${paymentAmount.toFixed(2)} processed successfully!`);
    
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 3. Environment Variables (Frontend)
Add to your `.env` file:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Key Features

### Dynamic Amount Handling
- **Deposit Payments**: Automatically calculates 50% of total
- **Full Payments**: Uses complete invoice total
- **Tips**: Uses user-entered amount
- **All amounts converted to cents** for Stripe (multiply by 100)

### Payment Metadata
Each payment includes:
- `invoiceId`: Links payment to specific invoice
- `paymentType`: Identifies if it's deposit, full, or tip
- Custom fields as needed

### Error Handling
- Network errors
- Stripe API errors
- Invalid payment amounts
- User cancellation

## Testing

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Test Mode
- Use test keys (starting with `sk_test_` and `pk_test_`)
- No real money is charged
- Full Stripe dashboard access for testing

## Production Deployment

1. **Replace test keys** with live keys (`sk_live_` and `pk_live_`)
2. **Enable webhooks** for payment confirmations
3. **Add proper error logging**
4. **Implement payment confirmation** updates to your database
5. **Set up proper SSL** certificates

## Webhook Example (Optional)
```javascript
// Handle successful payments
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update your database, send confirmation email, etc.
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

This setup allows you to charge any amount dynamically based on your invoice totals while maintaining security and proper error handling.