/* -------------------------------------------------------
The code defines a React context (`AppContext`) to manage global state and functionality for an e-commerce application. 

First, it imports necessary dependencies: 
- `createContext` and `useContext` from React are used to create and consume the context.
- `useState` and `useEffect` are React hooks for managing state and side effects.
- `useNavigate` from `react-router-dom` is used for programmatic navigation between routes.
- `assets` and `dummyProducts` are imported from a local file, containing static data like product details.
- `toast` from `react-hot-toast` is a library for displaying non-intrusive notifications (e.g., success messages when items are added to the cart).
- `axios` is a popular HTTP client for making API requests. It's configured with `withCredentials=true` to allow sending cookies in cross-origin requests and a `baseURL` set from an environment variable (`VITE_BACKEND_URL`) for consistent API endpoint handling.

Next, the `AppContextProvider` component is created. It initializes various states:
- `user`, `isSeller`, `showUserLogin`, `products`, `cartItems`, and `searchQuery` manage user-related, product-related, and cart-related data.
- A `currency` variable is set from an environment variable (`VITE_CURRENCY`) to standardize the currency display.

The `fetchProducts` function simulates fetching products by setting dummy product data into the state. Cart-related functions (`addToCart`, `updateCartItem`, `removeFromCart`) handle adding, updating, and removing items from the cart:
- `addToCart` increments the quantity of an item or adds it if not already in the cart, with a toast notification.
- `updateCartItem` adjusts the quantity of an item in the cart, also with a toast notification.
- `removeFromCart` decrements the quantity of an item and removes it entirely if the quantity reaches zero, again with a toast notification.

Two helper functions, `getCartCount` and `getCartAmount`, calculate the total number of items and the total cost in the cart, respectively. The total cost is rounded to two decimal places using `Math.floor`.

Inside a `useEffect`, the `fetchProducts` function is called once on component mount to populate the product list.

Finally, all states, functions, and utilities (like `navigate` and `axios`) are passed down via the context provider's `value` prop, making them accessible to child components. The `useAppContext` hook is exported to simplify consuming the context elsewhere in the app.
------------------------------------------------------- */

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets, dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  const currency = import.meta.env.VITE_CURRENCY;

  // Fetch User Auth status, user data and cartItems

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch {
      setUser(null);
    }
  };

  // Fetch Seller Status

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch {
      setIsSeller(false);
    }
  };

  // Fetch all Products

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        // toast.success(data.message);
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add Product to Cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  // Remove Product from Cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    setCartItems(cartData);
    toast.success("Removed from Cart");
  };

  // Get Cart Count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Get cart total amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      let itemInfo = products.find((product) => product._id === item);
      if (cartItems[item] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[item];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchSeller();
  }, []);

  // Update Database Cart Items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (user) {
      updateCart();
    }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    fetchProducts,
    currency,
    cartItems,
    setCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
