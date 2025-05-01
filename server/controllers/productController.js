import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// Add Product: /api/product/add
/* -------------------------------------------------------
The code defines an asynchronous function `addProduct` to handle adding a product. It starts by parsing product data from the request body and extracting uploaded images from `req.files`. 

Next, it processes each image by uploading it to Cloudinary using the `cloudinary.uploader.upload` method. The URLs of the uploaded images are collected into an array called `imagesUrl` using `Promise.all`.

After processing the images, the function creates a new product in the database using the `Product.create` method, combining the parsed product data with the image URLs.

If the operation is successful, a JSON response is sent indicating success and confirming the product was added. If an error occurs at any point, it logs the error message and sends a failure response with the error details.
------------------------------------------------------- */

export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );
    await Product.create({ ...productData, image: imagesUrl });
    res.json({ success: true, message: "Product added" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product: /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single Product: /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change product in stock: /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
