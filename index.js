const express = require('express');
const app = express();
require('dotenv').config();

const stripe = require('stripe')(process.env.SECRET_KEY);

const PORT = process.env.PORT || process.env.APP_PORT;

//app configurations
app.use(express.json());


// Make a call to the API
app.get('/api', async (req, res) => {

    const { apiKey } = req.query.apiKey;


    // TODO validate that the API key is valid
    if (!apiKey) {
        // bad request
        res.status(400).send({error: 'Invalid apiKey'});
    }

    const hashAPIKey = hashAPIKey(apiKey);
    const customer = customers[customerId];

    if (!customer|| !customer.active) {
        res.status(403).send({error: 'Not authorized'});
    } else {
        // Record usage with Stripe billing
        const record = await stripe.subscriptionItems.createUsageRecord(
            customer.itemId,
            {
                quantity: 1,
                timestamp: 'now',
                action: 'increment',
            }
        );
    }


   

    res.send({ data: "🔥🔥🔥🔥🔥🔥", usage: record });
});

// POST http://localhost:8080/checkout
// Create a stripe Checkout session to create a customer and subscribe them to a plan
app.post('/checkout', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: 'price_1KrWC2LCMFZ1sVLXvxgX161a'
            },
        ],
        success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:8080/error'
    });

    res.send(session);
});

// POST http://localhost:8080/checkout
// listen for webhooks from stripe when important events happen
app.post('/webhook', async (req, res) => {
    let data;
    let eventType;
    // check if webhook signing is configured
    const webhooksecret = 'whsec_7286dee9c7a3c19b3e3a61f560f257cbb8c417eed153245984117eaab572877e';

    if (webhook) {
        // Retrieve the event by verifying the signature using the raw body and secret
        let event;
        let signature = req.headers['stripe-signature'];

        try {
            event = stripe.webhooks.constructEvent(
                req['rawBody'],
                signature,
                webhooksecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        // Extract the object from the event
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    switch (eventType) {
        case 'checkout.session.completed':
            // data is in the event object
            const customerId = data.object.customer;
            const subscriptionId = data.object.subscription;
            console.log(`Customer ${customerId} just subscribed to ${subscriptionId}`);

            // TODO save customerId and subscriptionId to database
            // TODO send email to customer
            // Get the subscription.The 1st item is the plan
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const itemId = subscription.items.data[0].id;

            // Generate API key
            const { apiKey, hashedAPIKey } = generateApiKey();
            console.log(`Generated API key: ${apiKey}`);

            // store apiKey in database
            customers[customerId] = { apiKey: hashedAPIKey, subscriptionId: subscriptionId, itemId: itemId };
            apikeys[hashedAPIKey] = customerId;

            break;
        case 'invoice.paid':
            break;
        case 'invoice.payment_failed':
            break;

        default:
        // Unhandled event type
    }
});

// TODO: Implement a real database
// reverse mapping of stripe to API keyconst 
const customers = {
    // stripeCustomerID : data
    stripeCustomerId: {
        apiKey: 'apiKey',
        active: false,
        itemId: 'stripeItemId',
        calls: 0,
    },
};
const apiKeys = {
    // apiKey: customerdata
    'apiKey': 'cust1',
}

// Recursive function to generate a unique random string as a apiKey
function generateApiKey() {
    const { randomBytes } = require('crypto');
    const apiKey = randomBytes(16).toString('hex');
    const hashedAPIKey = hashAPIKey(apiKey);

    // Ensure PAI key is unique
    if (apikeys[hashedAPIKey]) {
        generateApiKey();
    } else {
        return { hashedAPIKey, apiKey };
    }

}

// compare the API key to the hashed version in database
function hashAPIKey(apiKey) {
    const { createHash } = require('crypto');
    const hashedAPIKey = createHash('md5').update(apiKey).digest('hex');
    return hashAPIKey
}

// listening for incoming requests on port.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});