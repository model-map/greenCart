import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import stripe from "stripe";

// Place order COD : /api/order/cod
/* -------------------------------------------------------

The code defines an API endpoint for placing a cash-on-delivery (COD) order. 

First, it imports the necessary models, `Order` and `Product`. The function `placeOrderCOD` is then exported to handle the request.

The function begins by extracting `userId`, `items`, and `address` from the request body. It validates the input data, ensuring that an address is provided and that the items array is not empty. If validation fails, it returns a JSON response indicating invalid data.

Next, it calculates the total order amount by iterating over the items using `reduce`. For each item, it retrieves the product's details from the database using its ID and computes the total price based on the product's offer price and quantity. A 2% tax is then added to the calculated amount.

Afterward, a new order is created in the database with the user's ID, items, calculated amount, address, and payment type set as "COD".

Finally, if the process completes successfully, a success response is sent back to the client. If any error occurs during execution, it logs the error message and sends a failure response.

------------------------------------------------------- */

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }
    // Calculate Amount using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });
    return res.json({ success: true, message: "Order Place Successfully" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe : /api/order/stripe
/* -------------------------------------------------------

The code defines an asynchronous function `placeOrderStripe` to handle the creation of an online order using the Stripe payment gateway.

First, it extracts data from the request body (`userId`, `items`, `address`) and headers (`origin`). It validates the input by checking if the `address` exists and if there are items in the cart. If the validation fails, it returns a JSON response with an error message.

Next, it calculates the total order amount:
- Using the `reduce` method, it iterates over the `items` array to fetch product details (via `Product.findById`) and computes the total price based on the product's `offerPrice` and quantity.
- A 2% tax is added to the total amount, which is then used to create a new order in the database using the `Order.create` method.

The function initializes the Stripe API using the `stripe` library, passing the `STRIPE_SECRET_KEY` from environment variables. It prepares the `line_items` array required by Stripe:
- Each item includes the product name, unit price (including tax), and quantity. The unit price is converted to the smallest currency unit (e.g., cents) by multiplying by 100.

A Stripe checkout session is created using `stripeInstance.checkout.sessions.create`. The session includes:
- `line_items` for the products,
- `mode` set to "payment" for one-time payments,
- `success_url` and `cancel_url` to redirect users after payment success or cancellation,
- `metadata` to store additional information like the `orderId` and `userId`.

Finally, the function returns a JSON response with the Stripe session URL if successful. If any errors occur during the process, they are caught in the `catch` block, logged to the console, and returned as a JSON response with an error message.

Libraries and their options:
- `stripe`: A library for integrating Stripe's payment gateway. It uses `process.env.STRIPE_SECRET_KEY` to authenticate API requests.
- `reduce`: A JavaScript array method used to calculate the total order amount by iterating over the items.
- `Math.floor`: Ensures the calculated amounts are rounded down to the nearest integer to avoid floating-point precision issues.

------------------------------------------------------- */

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    // Calculate Amount using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe Gateway Initialise
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Stripe Webhooks to verify payment actions : /stripe

export const stripeWebhooks = async (req, res) => {
  // Stripe Gateway Initialise
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOKS_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;

      // Mark Payment as Paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Clear Cart Data
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default: {
      console.error(`Unhandled event type ${event.type}`);
      break;
    }
  }
  res.json({ received: true });
};

//  Get Order by User ID : /api/order/user
/* -------------------------------------------------------

The code defines an asynchronous function named `getUserOrders` which retrieves orders for a specific user.

It begins by extracting the `userId` from the request body. Using this `userId`, it queries the `Order` collection in the database to find orders that match the user and meet either of two conditions: payment type is "COD" or the order is marked as paid. 

The retrieved orders are then enriched with related product and address details through the `.populate()` method. The results are sorted in descending order based on their creation date. If successful, the function responds with a JSON object containing the success status and the list of orders.

In case of an error during execution, the function logs the error message and responds with a JSON object indicating failure along with the error message.
------------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    console.log(userId);
    console.log(orders);
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders (for seller / admin ) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        {
          paymentType: "COD",
        },
        { isPaid: true },
      ],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
