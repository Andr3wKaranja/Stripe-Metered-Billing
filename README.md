# API Metered Billing[ 🚧 Under development 👷🔧️🚧 ]

### Background

Develop a billing system API that charges customers when they use your product or service via [Stripe Metered Billing](https://stripe.com/docs/billing/subscriptions/metered-billing)

### Prerequisites

Before you run the application, ensure you:

- Sign up for a [Stripe account](https://dashboard.stripe.com/) and create a new product. It is important that this product is **recurring** and **metered**.
- add a stripe secret Key in the `index.js` file.

```js
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```