// Adnew Limousine - Stripe Payment Server

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const path = require('path');
const app = express();
app.use(express.json());
app.use(cors());
// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', customer_info, trip_info } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: {
                pickup_location: trip_info.pickupLocation,
                dropoff_location: trip_info.dropoffLocation,
                vehicle_type: trip_info.vehicleType,
                customer_name: customer_info.name,
                customer_email: customer_info.email,
                customer_phone: customer_info.phone
            }
        });
        res.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({received: true});
});

app.post('/send-receipt', async (req, res) => {
    try {
        const nodemailer = require('nodemailer');
        const { receipt_data, customer_email } = req.body;

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Generate simple HTML receipt
        const html = `<h2>Adnew Limousine Receipt</h2>
            <p><strong>Name:</strong> ${receipt_data.customerName || ''}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Pickup:</strong> ${receipt_data.pickupLocation || ''}</p>
            <p><strong>Dropoff:</strong> ${receipt_data.dropoffLocation || ''}</p>
            <p><strong>Vehicle:</strong> ${receipt_data.vehicleType || ''}</p>
            <p><strong>Total:</strong> $${receipt_data.total || ''}</p>
            <p><strong>Payment ID:</strong> ${receipt_data.paymentIntentId || ''}</p>`;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: customer_email,
            subject: 'Your Adnew Limousine Receipt',
            html
        });

        res.json({ success: true, message: 'Receipt sent successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
