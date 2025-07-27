// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let paymentProcessor;
    let stripe;
    let cardElement;
    let currentReceiptData = null;

    // Initialize payment processor
    async function initializeApp() {
        try {
            // Wait a bit for scripts to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if PaymentProcessor is available
            if (typeof PaymentProcessor === 'undefined') {
                throw new Error('PaymentProcessor class not found. Please ensure payment.js is loaded.');
            }
            
            paymentProcessor = new PaymentProcessor();
            await initializeStripe();
            setupEventListeners();
            setDefaultDate();
        } catch (error) {
            console.error('Initialization error:', error);
            showMessage('Error initializing payment system: ' + error.message, 'error');
        }
    }

    // Initialize Stripe
    async function initializeStripe() {
        // Use config from global STRIPE_CONFIG
        const publishableKey = window.STRIPE_CONFIG ? window.STRIPE_CONFIG.publishableKey : 'pk_test';

        if (typeof Stripe !== 'undefined') {
            stripe = Stripe(publishableKey);
            const elements = stripe.elements();
            
            // Create card element
            cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#eaeaea',
                        backgroundColor: '#2a2a2a',
                        '::placeholder': {
                            color: '#888',
                        },
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    },
                },
            });
            
            cardElement.mount('#card-element');
            
            // Handle real-time validation errors from the card Element
            cardElement.on('change', function(event) {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });
        }
    }

    // Set default date to today
    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trip-date').value = today;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Calculate fare button
        document.getElementById('calculate-fare').addEventListener('click', calculateFare);
        
        // Payment method buttons
        document.getElementById('cash-payment').addEventListener('click', () => processCashPayment());
        document.getElementById('card-payment').addEventListener('click', () => showCardForm());
        
        // Submit card payment
        document.getElementById('submit-payment').addEventListener('click', processCardPayment);
        
        // Receipt actions
        document.getElementById('print-receipt').addEventListener('click', printReceipt);
        document.getElementById('email-receipt').addEventListener('click', emailReceipt);
        document.getElementById('new-transaction').addEventListener('click', newTransaction);

        // Real-time tip calculation
        document.getElementById('tip-amount').addEventListener('input', updateTipDisplay);
    }

    // Calculate fare based on form data
    function calculateFare() {
        const formData = getFormData();
        
        if (!validateTripForm(formData)) {
            return;
        }

        // Calculate fare (simplified calculation - in real app, use Google Maps API for distance)
        const rates = {
            'sedan': 3.50,
            'suv': 4.50,
            'stretch': 8.00,
            'van': 5.50
        };

        // Minimum fares by vehicle type
        const minimumFares = {
            'sedan': 25,
            'suv': 120,
            'stretch': 25,
            'van': 25
        };

        const estimatedDistance = 10; // You would calculate this based on pickup/dropoff locations
        const baseRate = rates[formData.vehicleType] || rates.sedan;
        let baseFare = estimatedDistance * baseRate;
        
        // Apply minimum fare based on vehicle type
        const minimumFare = minimumFares[formData.vehicleType] || minimumFares.sedan;
        baseFare = Math.max(baseFare, minimumFare);

        const serviceFees = 0; // Add any service fees here
        const tip = parseFloat(formData.tipAmount) || 0;
        const total = baseFare + serviceFees + tip;

        // Display fare breakdown
        document.getElementById('base-fare').textContent = `$${baseFare.toFixed(2)}`;
        document.getElementById('service-fees').textContent = `$${serviceFees.toFixed(2)}`;
        document.getElementById('tip-display').textContent = `$${tip.toFixed(2)}`;
        document.getElementById('total-fare').textContent = `$${total.toFixed(2)}`;

        // Show fare display and payment methods
        document.getElementById('fare-display').style.display = 'block';
        document.getElementById('payment-methods').style.display = 'block';

        // Store calculated values for later use
        window.currentFareData = {
            baseFare: baseFare,
            serviceFees: serviceFees,
            tip: tip,
            total: total
        };

        showMessage('Fare calculated successfully!', 'success');
    }

    // Update tip display in real-time
    function updateTipDisplay() {
        if (window.currentFareData) {
            const tip = parseFloat(document.getElementById('tip-amount').value) || 0;
            const newTotal = window.currentFareData.baseFare + window.currentFareData.serviceFees + tip;
            
            document.getElementById('tip-display').textContent = `$${tip.toFixed(2)}`;
            document.getElementById('total-fare').textContent = `$${newTotal.toFixed(2)}`;
            
            // Update stored data
            window.currentFareData.tip = tip;
            window.currentFareData.total = newTotal;
        }
    }

    // Process cash payment
    function processCashPayment() {
        const formData = getFormData();
        const fareData = window.currentFareData;

        if (!fareData) {
            showMessage('Please calculate fare first', 'error');
            return;
        }

        // Generate receipt for cash payment
        const receiptData = paymentProcessor.generateReceipt({
            ...formData,
            ...fareData
        }, 'cash');

        currentReceiptData = receiptData;
        paymentProcessor.saveReceipt(receiptData);
        
        showReceiptOptions();
        showMessage('Cash payment recorded successfully!', 'success');
    }

    // Show card payment form
    function showCardForm() {
        const fareData = window.currentFareData;

        if (!fareData) {
            showMessage('Please calculate fare first', 'error');
            return;
        }

        document.getElementById('card-form').style.display = 'block';
        document.getElementById('card-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Process card payment
    async function processCardPayment() {
        const formData = getFormData();
        const fareData = window.currentFareData;

        if (!fareData) {
            showMessage('Please calculate fare first', 'error');
            return;
        }

        showLoading(true);

        try {
            // In a real application, you would create a payment intent on your server
            // For this demo, we'll simulate the process
            
            // Note: This is a simplified demo. In production, you need:
            // 1. A server endpoint to create payment intents
            // 2. Proper error handling
            // 3. Webhook handling for payment confirmation
            
            showMessage('Note: This is a demo. In production, you need a server to process payments.', 'warning');
            
            // Simulate successful payment for demo purposes
            setTimeout(() => {
                const receiptData = paymentProcessor.generateReceipt({
                    ...formData,
                    ...fareData,
                    paymentIntentId: 'pi_demo_' + Date.now() // Demo transaction ID
                }, 'credit card');

                currentReceiptData = receiptData;
                paymentProcessor.saveReceipt(receiptData);
                
                showLoading(false);
                showReceiptOptions();
                showMessage('Payment processed successfully!', 'success');
            }, 2000);

        } catch (error) {
            showLoading(false);
            showMessage('Payment failed: ' + error.message, 'error');
        }
    }

    // Show receipt options
    function showReceiptOptions() {
        document.getElementById('receipt-container').style.display = 'block';
        document.getElementById('receipt-container').scrollIntoView({ behavior: 'smooth' });
    }

    // Print receipt
    function printReceipt() {
        if (currentReceiptData) {
            paymentProcessor.displayReceipt(currentReceiptData);
        }
    }

    // Email receipt
    async function emailReceipt() {
        if (!currentReceiptData) {
            showMessage('No receipt data available to email', 'error');
            return;
        }

        showLoading(true);
        
        try {
            const response = await fetch('/send-receipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receipt_data: {
                        customerName: currentReceiptData.customer.name,
                        pickupLocation: currentReceiptData.trip.pickupLocation,
                        dropoffLocation: currentReceiptData.trip.dropoffLocation,
                        vehicleType: currentReceiptData.trip.vehicleType,
                        total: currentReceiptData.payment.total,
                        paymentIntentId: currentReceiptData.payment.paymentIntentId || currentReceiptData.receiptId
                    },
                    customer_email: currentReceiptData.customer.email
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                showMessage('Receipt sent successfully to ' + currentReceiptData.customer.email, 'success');
            } else {
                showMessage('Failed to send receipt: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            showMessage('Error sending receipt: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Start new transaction
    function newTransaction() {
        // Reset all forms and displays
        document.getElementById('trip-form').reset();
        document.getElementById('fare-display').style.display = 'none';
        document.getElementById('payment-methods').style.display = 'none';
        document.getElementById('card-form').style.display = 'none';
        document.getElementById('receipt-container').style.display = 'none';
        
        // Clear stored data
        window.currentFareData = null;
        currentReceiptData = null;
        
        // Reset date to today
        setDefaultDate();
        
        // Scroll to top of payment section
        document.getElementById('payment').scrollIntoView({ behavior: 'smooth' });
        
        showMessage('Ready for new transaction', 'success');
    }

    // Get form data
    function getFormData() {
        return {
            customerName: document.getElementById('customer-name').value,
            customerEmail: document.getElementById('customer-email').value,
            customerPhone: document.getElementById('customer-phone').value,
            vehicleType: document.getElementById('vehicle-type').value,
            pickupLocation: document.getElementById('pickup-location').value,
            dropoffLocation: document.getElementById('dropoff-location').value,
            tripDate: document.getElementById('trip-date').value,
            tripTime: document.getElementById('trip-time').value,
            tipAmount: document.getElementById('tip-amount').value
        };
    }

    // Validate trip form
    function validateTripForm(data) {
        const required = ['customerName', 'customerEmail', 'customerPhone', 'vehicleType', 
                         'pickupLocation', 'dropoffLocation', 'tripDate', 'tripTime'];
        
        for (let field of required) {
            if (!data[field]) {
                showMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                return false;
            }
        }
        
        return true;
    }

    // Show loading indicator
    function showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    // Show message to user
    function showMessage(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`); // Always log to console
        
        const container = document.getElementById('message-container');
        if (!container) {
            alert(`${type.toUpperCase()}: ${message}`); // Fallback to alert
            return;
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }

    // Initialize the app
    initializeApp();
});

// Utility function to format phone numbers
function formatPhoneNumber(phoneNumber) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
}

// Add phone number formatting to the phone input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('customer-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }
});
