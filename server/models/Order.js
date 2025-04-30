import mongoose from "mongoose";

/* -------------------------------------------------------

The code defines a Mongoose schema for an "Order" model. The schema includes fields such as `userId`, which is a required string referencing the "user" model, and `items`, an array of objects containing `product` (referencing the "product" model) and `quantity`. Other fields include `amount`, `address` (referencing the "address" model), `status` with a default value of "Order Placed", `paymentType`, and `isPaid` with a default value of false.

The schema also enables timestamps to track creation and update times. 

Finally, the code creates or retrieves the "order" model using `mongoose.models.order` to avoid redefining it if it already exists, and exports it as the default export.

------------------------------------------------------- */

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "user" },
    items: [
      {
        product: { type: String, required: true, ref: "product" },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: "address" },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
