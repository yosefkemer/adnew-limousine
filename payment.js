// Payment Processing and Receipt Generation
class PaymentProcessor {
    constructor() {
        this.stripe = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        if (typeof Stripe !== 'undefined' && window.STRIPE_CONFIG) {
            this.stripe = Stripe(window.STRIPE_CONFIG.publishableKey);
        }
    }

    // Calculate fare based on miles, minimum rate, per mile rate, and tip
    calculateFare(vehicleType, miles, tip = 0, additionalServices = []) {
        // Base rates per mile
        const rates = {
            'sedan': 2.75,
            'suv': 2.75,
            'Sprinter Van': 6.00
        };
        // Minimum fares by vehicle type
        const minimumFares = {
            'sedan': 85.00,
            'suv': 85.00,
            'Sprinter Van': 210.00
        };
        const baseRate = rates[vehicleType] || rates.sedan;
        const minimumFare = minimumFares[vehicleType] || minimumFares.sedan;
        miles = parseFloat(miles) || 0;
        tip = parseFloat(tip) || 0;
        let fareByMiles = miles * baseRate;
        let serviceFees = fareByMiles;
        let baseFare = minimumFare;
        const totalFare = baseFare + serviceFees + tip;
        return {
            baseFare: baseFare,
            serviceFees: serviceFees,
            tip: tip,
            total: totalFare,
            miles: miles,
            baseRate: baseRate,
            minimumFare: minimumFare
        };
    }

    // Process credit card payment
    async processCardPayment(paymentData) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(
                paymentData.clientSecret,
                {
                    payment_method: {
                        card: paymentData.cardElement,
                        billing_details: {
                            name: paymentData.customerName,
                            email: paymentData.customerEmail,
                            phone: paymentData.customerPhone,
                        },
                    },
                }
            );

            if (error) {
                throw new Error(error.message);
            }

            return {
                success: true,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate receipt data
    generateReceipt(paymentData, paymentMethod = 'cash') {
        const receiptId = this.generateReceiptId();
        const timestamp = new Date();

        return {
            receiptId: receiptId,
            timestamp: timestamp,
            business: window.STRIPE_CONFIG.businessInfo,
            customer: {
                name: paymentData.customerName,
                email: paymentData.customerEmail,
                phone: paymentData.customerPhone
            },
            trip: {
                pickupLocation: paymentData.pickupLocation,
                dropoffLocation: paymentData.dropoffLocation,
                vehicleType: paymentData.vehicleType,
                date: paymentData.tripDate,
                time: paymentData.tripTime
            },
            payment: {
                method: paymentMethod,
                baseFare: paymentData.baseFare,
                serviceFees: paymentData.serviceFees || 0,
                tip: paymentData.tip || 0,
                total: paymentData.total,
                paymentIntentId: paymentData.paymentIntentId || null
            }
        };
    }

    // Generate unique receipt ID
    generateReceiptId() {
        const prefix = 'ADN';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`.toUpperCase();
    }

    // Print/Display receipt
    displayReceipt(receiptData) {
        const receiptWindow = window.open('', '_blank', 'width=600,height=800');
        const receiptHTML = this.generateReceiptHTML(receiptData);
        
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
            receiptWindow.print();
        }, 1000);
    }

    // Generate receipt HTML
    generateReceiptHTML(receipt) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${receipt.receiptId}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    max-width: 400px; 
                    margin: 20px auto; 
                    padding: 20px;
                    background: white;
                    color: black;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #000; 
                    padding-bottom: 10px; 
                    margin-bottom: 15px;
                }
                .logo { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #ffd700;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
                .business-info { 
                    font-size: 12px; 
                    margin-top: 5px; 
                }
                .section { 
                    margin: 15px 0; 
                    padding: 10px 0; 
                    border-bottom: 1px dashed #ccc; 
                }
                .row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 5px 0; 
                }
                .total { 
                    font-weight: bold; 
                    font-size: 16px; 
                    border-top: 2px solid #000; 
                    padding-top: 10px; 
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px; 
                    font-size: 10px; 
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">${receipt.business.name}</div>
                <div class="business-info">
                    ${receipt.business.address}<br>
                    ${receipt.business.phone}<br>
                    ${receipt.business.email}
                </div>
            </div>

            <div class="section">
                <strong>Receipt #: ${receipt.receiptId}</strong><br>
                <strong>Date: ${receipt.timestamp.toLocaleDateString()}</strong><br>
                <strong>Time: ${receipt.timestamp.toLocaleTimeString()}</strong>
            </div>

            <div class="section">
                <strong>Customer Information:</strong><br>
                Name: ${receipt.customer.name}<br>
                Email: ${receipt.customer.email}<br>
                Phone: ${receipt.customer.phone}
            </div>

            <div class="section">
                <strong>Trip Details:</strong><br>
                From: ${receipt.trip.pickupLocation}<br>
                To: ${receipt.trip.dropoffLocation}<br>
                Vehicle: ${receipt.trip.vehicleType.toUpperCase()}<br>
                Trip Date: ${receipt.trip.date}<br>
                Trip Time: ${receipt.trip.time}
            </div>

            <div class="section">
                <strong>Payment Breakdown:</strong><br>
                <div class="row">
                    <span>Base Fare:</span>
                    <span>$${receipt.payment.baseFare.toFixed(2)}</span>
                </div>
                ${receipt.payment.serviceFees > 0 ? `
                <div class="row">
                    <span>Service Fees:</span>
                    <span>$${receipt.payment.serviceFees.toFixed(2)}</span>
                </div>
                ` : ''}
                ${receipt.payment.tip > 0 ? `
                <div class="row">
                    <span>Tip:</span>
                    <span>$${receipt.payment.tip.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="row total">
                    <span>Total:</span>
                    <span>$${receipt.payment.total.toFixed(2)}</span>
                </div>
                <div class="row">
                    <span>Payment Method:</span>
                    <span>${receipt.payment.method.toUpperCase()}</span>
                </div>
                ${receipt.payment.paymentIntentId ? `
                <div class="row">
                    <span>Transaction ID:</span>
                    <span>${receipt.payment.paymentIntentId}</span>
                </div>
                ` : ''}
            </div>

            <div class="footer">
                Thank you for choosing ${receipt.business.name}!<br>
                Safe travels and see you again soon.
            </div>
        </body>
        </html>
        `;
    }

    // Save receipt to local storage for record keeping
    saveReceipt(receiptData) {
        const receipts = JSON.parse(localStorage.getItem('adnew_receipts') || '[]');
        receipts.push(receiptData);
        localStorage.setItem('adnew_receipts', JSON.stringify(receipts));
    }

    // Get all saved receipts
    getSavedReceipts() {
        return JSON.parse(localStorage.getItem('adnew_receipts') || '[]');
    }
}

// Export for use in other files
window.PaymentProcessor = PaymentProcessor;
