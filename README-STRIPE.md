# Stripe Payment Integration Setup Guide

## 🎯 Overview
This guide will help you set up Stripe payment processing for your Adnew Limousine service, including both cash and credit card payment receipts.

## 🔧 Setup Instructions

### 1. Get Your Stripe Credentials

1. **Sign in to Stripe Dashboard**
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign in with your existing Stripe account

2. **Get Your API Keys**
   - In the Stripe Dashboard, go to **Developers** → **API keys**
   - You'll see two types of keys:
     - **Publishable key** (starts with `pk_test_` for testing or `pk_live_` for production)
     - **Secret key** (starts with `sk_test_` for testing or `sk_live_` for production)

3. **Update Configuration**
   - Open `config.js` in your project
   - Replace `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE` with your actual publishable key
   - Example: `pk_test_51HexampleBcde123...`

### 2. Update Your Stripe Keys

#### In `config.js`:
```javascript
const STRIPE_CONFIG = {
    // Replace with your actual Stripe publishable key
    publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
    // ... rest of config
};
```

#### In `app.js`:
```javascript
// Around line 15, replace the demo key:
const publishableKey = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

### 3. Test vs Live Mode

- **Test Mode**: Use `pk_test_...` and `sk_test_...` keys
  - All transactions are simulated
  - Use test card numbers (4242 4242 4242 4242)
  - No real money is charged

- **Live Mode**: Use `pk_live_...` and `sk_live_...` keys
  - Real transactions with real money
  - Switch when you're ready to go live

### 4. Server Setup (For Production)

For production use, you need a server to handle payments securely:

1. **Install Node.js** (if you haven't already)
2. **Create a server** using the example in `server-example.js`
3. **Install dependencies**:
   ```bash
   npm install express stripe cors dotenv
   ```
4. **Set environment variables**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### 5. Webhook Setup (For Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://your-domain.com/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret to your environment variables

## 🛠 Features Included

### ✅ Current Features
- **Trip Information Form**: Collect customer and trip details
- **Fare Calculator**: Automatic fare calculation based on vehicle type
- **Payment Methods**: Support for both cash and credit card payments
- **Receipt Generation**: Professional receipts for both payment types
- **Receipt Printing**: Print receipts directly from the browser
- **Transaction Storage**: Local storage of all transactions
- **Responsive Design**: Works on desktop and mobile devices

### 🔄 Payment Flow
1. **Enter Trip Details**: Customer info, pickup/dropoff, vehicle type
2. **Calculate Fare**: Automatic calculation with tip option
3. **Choose Payment Method**: Cash or Credit Card
4. **Process Payment**: Secure Stripe processing for cards
5. **Generate Receipt**: Professional receipt with all details
6. **Print/Email**: Print receipt or email to customer

### 💳 Test Card Numbers
For testing Stripe integration:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0027 6000 3184

Use any future expiry date and any 3-digit CVC.

## 🎨 Customization

### Vehicle Rates
Edit rates in `app.js` around line 60:
```javascript
const rates = {
    'sedan': 3.50,      // $3.50 per mile
    'suv': 4.50,        // $4.50 per mile
    'stretch': 8.00,    // $8.00 per mile
    'van': 5.50         // $5.50 per mile
};
```

### Minimum Fare
Change minimum fare in `app.js` around line 70:
```javascript
const minimumFare = 25; // $25 minimum
```

### Business Information
Update your business details in `config.js`:
```javascript
businessInfo: {
    name: 'Adnew Limousine Service',
    address: 'Houston, TX',
    phone: '832-623-2604',
    email: 'adnewlimo@gmail.com'
}
```

## 🚀 Going Live

### Before Going Live:
1. **Test thoroughly** with test cards
2. **Set up your server** with proper SSL certificates
3. **Configure webhooks** for payment confirmations
4. **Switch to live keys** in production
5. **Test with real (small) amounts** first

### Security Checklist:
- ✅ Never expose secret keys in client-side code
- ✅ Use HTTPS for all payment pages
- ✅ Implement proper error handling
- ✅ Set up webhook signature verification
- ✅ Store sensitive data securely on server

## 📞 Support

### Stripe Resources:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Test Cards](https://stripe.com/docs/testing)

### Common Issues:
1. **"Stripe not defined"**: Check if Stripe.js is loading properly
2. **Payment fails**: Verify your publishable key is correct
3. **Webhook errors**: Check webhook secret and endpoint URL
4. **CORS errors**: Ensure proper CORS configuration on server

## 📄 File Structure

```
your-project/
├── index.html          # Main HTML with payment interface
├── styles.css          # CSS including payment styles
├── config.js           # Stripe configuration (UPDATE THIS)
├── payment.js          # Payment processing logic
├── app.js              # Main application logic (UPDATE STRIPE KEY)
├── server-example.js   # Server-side example code
└── README-STRIPE.md    # This setup guide
```

## 🎉 You're All Set!

Once you've updated your Stripe keys, you can:
1. Test the payment system with test cards
2. Generate receipts for both cash and card payments
3. Print receipts for your customers
4. Track all transactions locally

Happy coding! 🚗💨
