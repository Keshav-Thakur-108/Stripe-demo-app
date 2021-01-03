if(process.env.NODE_ENV !=='production')
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static('public'))

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(stripeSecretKey)
app.get('/', (req, res)=> {
    res.render('index.ejs', {
        stripePublicKey: stripePublicKey
    })
})

app.get('/checkout-session', async(req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.id);
    res.json(session)
})

app.get('/cancel-subscription/:id', async (req, res)=> {
    const deleted = await stripe.subscriptions.del(req.params.id);
    res.json(deleted)
})

app.get('/subscription-list', async (req, res) => {
    const subscriptions = await stripe.subscriptions.list({
});
res.json(subscriptions)
})

app.post('/create-checkout-session',async (req, res)=> {
    const session = await stripe.checkout.sessions.create({
    success_url: 'https:localhost:3000/success?id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https:localhost:3000/',
    payment_method_types: ['card'],
    line_items: [
        {price: req.body.price, quantity: 1},
    ],
    mode: 'subscription',
});
res.json({
    id: session.id 
})
})

app.get('/success', (req, res)=> {
    res.render('success', {
        sessionId: req.query.id
    })
})

app.listen(3000, ()=> {
    console.log('Server started')
})