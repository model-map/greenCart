import Order from "../models/Order.js";
import Product from "../models/Product.js";

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
      $or: [
        {
          paymentType: "COD",
          isPaid: true,
        },
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

// Get All Orders (for seller / admin ) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: {
        paymentType: "COD",
        isPaid: true,
      },
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
