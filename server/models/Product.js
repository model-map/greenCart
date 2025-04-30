/* -------------------------------------------------------
The code defines a Mongoose schema and model for a "Product" in a MongoDB database.

First, it imports the `mongoose` library, which is used to interact with MongoDB. 

Next, it creates a `productSchema` using `mongoose.Schema`. The schema defines the structure of a product document, including fields like `name`, `description`, `price`, `offerPrice`, `image`, `category`, and `inStock`. Each field has a specific data type, and most are marked as required. The `inStock` field has a default value of `true`. The schema also enables timestamps to track when a document is created or updated.

Then, it checks if a model named "product" already exists in `mongoose.models` to avoid redefining it. If it doesn't exist, it creates a new model named "product" using the `productSchema`.

Finally, the `Product` model is exported for use in the application.
------------------------------------------------------- */

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
