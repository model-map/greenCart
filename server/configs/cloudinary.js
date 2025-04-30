/* -------------------------------------------------------
Cloudinary is a cloud-based service that helps developers store, manage, transform, and deliver images, videos, and other media assets. It provides APIs and tools to upload, optimize, and serve media files efficiently, ensuring fast loading times and reduced bandwidth usage.  

The main benefits of using Cloudinary include automatic image and video optimization, on-the-fly transformations (e.g., resizing, cropping, filters), secure storage, and a global CDN for fast delivery. This makes it a popular choice for applications needing scalable and efficient media management.

------------------------------------------------------- */

import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export default connectCloudinary;
