/* -------------------------------------------------------
The purpose of `multer` in this setup is to handle the initial file upload from the client and temporarily store the files on the server before they are uploaded to Cloudinary.

When a user submits a request to the `/add` route, `multer` processes the incoming multipart form data, which includes both the product details and the image files. It ensures that the files are properly received and stored temporarily (e.g., on disk or in memory). Without `multer`, the server wouldn't be able to parse and access the uploaded files from the request.

Once `multer` has processed the files, the `addProduct` controller takes over. It retrieves the temporary file paths provided by `multer` and uses them to upload the images to Cloudinary. After the files are successfully uploaded to Cloudinary, the temporary files handled by `multer` are no longer needed.

In summary, `multer` acts as a bridge to handle the initial file upload and make the files accessible to the server, while Cloudinary provides permanent cloud storage for the images.
------------------------------------------------------- */

import multer from "multer";
import path from "path";

const multerUploads = path.join(process.cwd(), "utils", "multerUploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, multerUploads);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage });
