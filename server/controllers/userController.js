/* -------------------------------------------------------
The code imports necessary modules: User model, bcryptjs, and jsonwebtoken. 

It defines an asynchronous function `register` to handle user registration via the route `/api/user/register`. 
First, it extracts `name`, `email`, and `password` from the request body. 
If any of these fields are missing, it returns a JSON response indicating failure and requesting the missing details.

Next, it checks if a user with the provided email already exists in the database. If so, it responds with a message stating that the user already exists. 

If the user doesn't exist, the password is hashed using bcrypt with a salt round of 10. A new user document is then created in the database using the hashed password.

After creating the user, a JWT token is generated, containing the user's ID as payload, signed with a secret key, and set to expire in 7 days. 

The token is stored in a cookie named "token", configured with security options like `httpOnly`, `secure` (in production), `sameSite`, and an expiration time of 7 days. 

Finally, the function sends a success response with the user's email and name. If any error occurs during this process, it logs the error message and sends a failure response with the error details.



------------------------------------------------------- */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register User: /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Missing details",
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=604800; Partitioned`
    );

    return res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login User: /api/user/login

/* -------------------------------------------------------
The code defines an asynchronous `login` function that handles user authentication.

First, it extracts the `email` and `password` from the request body.  
If either field is missing, it responds with an error message stating both are required.  

Next, it queries the database to find a user with the provided email.  
If no user is found, it returns an error indicating invalid email or password.  

Then, it uses bcrypt to compare the provided password with the stored hashed password.  
If the passwords don't match, it again responds with an "Invalid email or password" error.  

If authentication succeeds, it generates a JWT token containing the user's ID, set to expire in 7 days.  

The token is then stored in a cookie with security settings like `httpOnly`, `secure` (in production), and `sameSite`.  
Finally, it sends a success response with the user's email and name.  

If any error occurs during the process, it logs the error and sends a failure response with the error message.



------------------------------------------------------- */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email are Password are required",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=604800; Partitioned`
    );

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Auth: /api/user/is-auth
/* -------------------------------------------------------
The code defines an asynchronous function named `isAuth` that checks if a user is authenticated.  

It extracts the `userId` from the request body and uses it to find the corresponding user in the database.  
The `User.findById` method retrieves the user, excluding their password field for security.  
If successful, the function responds with a JSON object containing a success flag and the user data.  

If an error occurs during the process, it logs the error message to the console.  
It then sends a JSON response indicating failure along with the error message.  



------------------------------------------------------- */

export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/logout
/* -------------------------------------------------------
The code defines an asynchronous function named `logout` that handles user logout functionality.  

It starts by clearing a cookie named "token" using `res.clearCookie()`. The cookie is configured with options: `httpOnly` is set to true for security, `secure` is enabled only in production environments, and `sameSite` is set to "none" in production or "strict" otherwise.  

After clearing the cookie, the function sends a JSON response indicating successful logout with a message "Logged Out".  

If an error occurs during the process, it catches the error, logs the error message to the console, and sends a JSON response with `success: false` along with the error message.



------------------------------------------------------- */

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* -------------------------------------------------------



## Terminology explained  

- **`res.clearCookie()`**: *A method used in Express.js (Node.js framework) to delete a cookie on the client side by clearing its value and setting an expired expiration date.*  
- **`httpOnly`**: *A cookie option that prevents client-side scripts (like JavaScript) from accessing the cookie, enhancing security against cross-site scripting (XSS) attacks.*  
- **`secure`**: *A cookie option that ensures the cookie is only sent over HTTPS connections, providing protection in production environments where data encryption is critical.*  
- **`sameSite`**: *A cookie attribute that controls whether the cookie is sent with requests initiated by third-party websites. "None" allows cross-site requests, while "strict" restricts the cookie to first-party contexts only.*  
- **Production Environment**: *The deployment environment where the application runs for end users, typically configured with stricter security settings compared to development environments.* 



------------------------------------------------------- */
