// Stripe Configuration
// IMPORTANT: Replace with your actual Stripe publishable key
// Get this from: https://dashboard.stripe.com/apikeys
const STRIPE_CONFIG = {
    // Use your TEST publishable key for development (starts with pk_test_)
    // Use your LIVE publishable key for production (starts with pk_live_)
    publishableKey: 'pk_test',
    
    // Your business information
    businessInfo: {
        name: 'Adnew Limousine Service',
        address: 'Houston, TX',
        phone: '832-623-2604',
        email: 'adnewlimo@gmail.com'
    }
};

// For server-side operations, you'll need your secret key
// NEVER expose your secret key in client-side code
// Store it securely on your server or in environment variables
// Secret key format: sk_test_... or sk_live_...

// Make config available globally
window.STRIPE_CONFIG = STRIPE_CONFIG;
