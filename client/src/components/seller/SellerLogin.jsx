/* -------------------------------------------------------
The code defines a `SellerLogin` component for handling seller authentication in an e-commerce application.

First, it imports necessary dependencies:
- `useState` and `useEffect` from React are used to manage component state and side effects.
- `useAppContext` is a custom hook imported from the application's context to access global state and utilities like `isSeller`, `setIsSeller`, `navigate`, and `axios`.
- `toast` from `react-hot-toast` is used to display error notifications for failed login attempts.

The component initializes two local states: `email` and `password`, which store the user's input for login credentials. 

The `onSubmitHandler` function is an asynchronous event handler triggered when the form is submitted. It prevents the default form submission behavior, sends a POST request to the `/api/seller/login` endpoint using `axios`, and includes the email and password in the request body. If the response indicates a successful login (`data.success`), the `isSeller` state is updated to `true`, and the user is redirected to the `/seller` route using `navigate`. If the login fails, an error message from the backend or a generic error is displayed using `toast.error`.

A `useEffect` hook ensures that if the `isSeller` state is already `true` (indicating the user is logged in as a seller), they are automatically redirected to the `/seller` route.

The component's JSX renders a login form only if `isSeller` is `false`. The form includes:
- An email input field with `onChange` to update the `email` state.
- A password input field with `onChange` to update the `password` state.
- A submit button styled with a primary color.

The form uses `onSubmitCapture` to handle the submission event, ensuring the `onSubmitHandler` function is called when the form is submitted. The layout is styled with Tailwind CSS classes for a clean, responsive design.

Finally, the component is exported as the default export for use in other parts of the application.
------------------------------------------------------- */

import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post("/api/seller/login", {
        email,
        password,
      });
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  return (
    !isSeller && (
      <form
        onSubmitCapture={onSubmitHandler}
        className="min-h-screen flex justify-center items-center text-sm text-gray-600"
      >
        <div className="border border-gray-200 shadow-lg rounded-md px-8 py-12">
          <p className="text-2xl font-medium m-auto">
            <span className="text-primary">Seller </span>Login
          </p>
          <div className="w-full">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              required
            />
          </div>
          <div className="w-full">
            <p>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="text"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              required
            />
          </div>
          <button className="bg-primary text-white w-full py-2 rounded-md cursor-pointer">
            Login
          </button>
        </div>
      </form>
    )
  );
};

export default SellerLogin;
