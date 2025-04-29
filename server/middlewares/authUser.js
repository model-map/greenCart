/* -------------------------------------------------------
The code defines an asynchronous middleware function named `authUser` used for user authentication.  

It first extracts a token from the cookies in the request object. If no token is found, it responds with a JSON message indicating the user is "Not Authorised".  

In the try block, the function verifies the token using `jwt.verify()` with a secret stored in the environment variables. If the decoded token contains an `id`, it assigns this `id` to `req.body.userId`. Otherwise, it sends a "Not Authorised" response.  

If the token verification or any other part of the process fails, the catch block handles the error and returns a JSON response with the error message.  

Finally, if everything succeeds, the function calls `next()` to pass control to the next middleware.  

The `authUser` middleware is exported as the default export of the module.



------------------------------------------------------- */

import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorised" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorised" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;
