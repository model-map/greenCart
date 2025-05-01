import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";

const app = express();
const port = process.env.PORT || 4000;

// DB: Attempting connection
await connectDB();

// Cloudinary: Attempting connection
await connectCloudinary();

// CORS: allow multiple origins
const allowedOrigins = ["https://green-cart-frontend-eight.vercel.app"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply CORS before any routes or middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight

// Middleware Configuration
app.use(express.json());
app.use(cookieParser());

// Stripe Webhooks
app.post("/stripe", express.raw({ type: "application/json" }, stripeWebhooks));

app.get("/", (req, res) => {
  res.send("API is Working");
});
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
