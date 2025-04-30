/* -------------------------------------------------------
The code sets up an Express router for handling product-related routes in a Node.js application. 

First, it imports necessary modules and dependencies, including `express`, `multer` for file uploads, `authSeller` middleware for seller authentication, and several controller functions from the `productController`. 

Next, it initializes the `productRouter` using `express.Router()`. 

The router defines four routes: 
- A POST route `/add` to add a new product, which uses `upload.array()` for image uploads, checks seller authentication with `authSeller`, and calls the `addProduct` controller function.
- A GET route `/list` to retrieve a list of products using the `productList` controller.
- A GET route `/id` to fetch a product by its ID using the `productById` controller.
- A POST route `/stock` to update product stock, secured by `authSeller` middleware, and handled by the `changeStock` controller.

Finally, the configured `productRouter` is exported for use in the application.
------------------------------------------------------- */

import express from "express";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";
import {
  addProduct,
  changeStock,
  productById,
  productList,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/add", authSeller, upload.array("images"), addProduct);
productRouter.get("/list", productList);
productRouter.get("/id", productById);
productRouter.post("/stock", authSeller, changeStock);

export default productRouter;
