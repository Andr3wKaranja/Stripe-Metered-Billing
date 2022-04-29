const express = require('express')
const app = express()
require('dotenv').config()

const stripe = require('stripe')(process.env.SECRET_KEY)

// Make a call to the API
app.get('/api', (req, res) => {

   const { apiKey } = req.query;

   if(!apiKey){
       // bad request
        res.status(400).send({ error: 'Missing apiKey' });
   }

    res.send({ data: "🔥🔥🔥🔥🔥🔥" });
});

// POST http://localhost:8080/checkout
// Create a stripe Checkout session to create session to create a customer and subscribe them to a plan
app.post('/checkout', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
            price: 'price_1KrWC2LCMFZ1sVLXvxgX161a'
        }, ],
        success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:8080/error'
    });
    res.send(session);
});

// POST http://localhost:8080/checkout
// listen for webhooks from stripe when important events happen
app.post('/webhook', async(req, res) => {
    let data;
    let eventType;
    // check if webhook signing is configured
   const webhooksecret = '';

if(webhook){
    // Retrieve the event by verifying the signature using the
}

});

app.listen(8080, () => console.log('Server rocking at http://localhost:8080'));