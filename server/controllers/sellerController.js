import jwt from "jsonwebtoken";

// Login Seller: /api/seller/login

export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.setHeader(
        "Set-Cookie",
        `sellerToken=${token}; HttpOnly; Secure; SameSite=None; Max-Age=604800; Partitioned`
      );

      return res.json({
        success: true,
        message: "Logged In",
      });
    } else {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Seller Auth: /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    // const { sellerEmail } = req.body;
    // if (sellerEmail) {
    //   return res.json({ success: true });
    // } else {
    //   return res.json({ success: false, message: "Not Authorised" });
    // }
    return res.json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout Seller: /api/seller/logout

export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
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
