/* -------------------------------------------------------
The code imports the 'jsonwebtoken' library to handle JWT verification. 
It defines a middleware function named 'authSeller' to authenticate a seller.

First, it retrieves the 'sellerToken' from the cookies in the request object. 
If the token is missing, it responds with a "Not Authorised" message.

Next, if the token exists, it attempts to verify it using the 'jwt.verify' method with a secret stored in the environment variable 'JWT_SECRET'. 

After decoding the token, it checks if the email in the decoded token matches the 'SELLER_EMAIL' stored in the environment variables. 
If the email matches, the middleware calls the 'next()' function to proceed. 

If the email does not match or an error occurs during verification, it returns a failure response with either a "Not Authorised" message or the specific error message from the exception.
------------------------------------------------------- */

import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.json({ success: false, message: "Not Authorised" });
  } else {
    try {
      const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
      if (tokenDecode.email === process.env.SELLER_EMAIL) {
        req.body.sellerEmail = tokenDecode.email;
        next();
      } else {
        return { success: false, message: "Not Authorised" };
      }
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  }
};

export default authSeller;
