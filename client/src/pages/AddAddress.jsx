import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext.jsx";

// Input Field Component
const InputField = ({ type, placeholder, name, handleChange, address }) => {
  return (
    <input
      className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={handleChange}
      value={address[name]}
      required
    />
  );
};

const AddAddress = () => {
  const { user, axios, navigate } = useAppContext();
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post("/api/address/add", {
        userId: user._id,
        address,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/cart");
    }
  }, [user, navigate]);

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>
      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="firstName"
                type="text"
                placeholder="First Name"
              ></InputField>
              <InputField
                handleChange={handleChange}
                address={address}
                name="lastName"
                type="text"
                placeholder="Last Name"
              ></InputField>
            </div>
            <InputField
              handleChange={handleChange}
              address={address}
              name="email"
              type="email"
              placeholder="Email Address"
            ></InputField>
            <InputField
              handleChange={handleChange}
              address={address}
              name="street"
              type="text"
              placeholder="Street"
            ></InputField>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="city"
                type="text"
                placeholder="City"
              ></InputField>
              <InputField
                handleChange={handleChange}
                address={address}
                name="state"
                type="text"
                placeholder="State"
              ></InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="zipcode"
                type="number"
                placeholder="Zipcode"
              ></InputField>
              <InputField
                handleChange={handleChange}
                address={address}
                name="country"
                type="text"
                placeholder="Country"
              ></InputField>
            </div>
            <InputField
              handleChange={handleChange}
              address={address}
              name="phone"
              type="text"
              placeholder="Phone Number"
            ></InputField>

            <button className="bg-primary hover:bg-primary-dull cursor-pointer w-full h-10 rounded mt-6 text-white py-3 uppercase transition">
              Save Address
            </button>
          </form>
        </div>
        <img
          src={assets.add_address_iamge}
          alt=""
          className="md:mr-16 mb-16 md:mt-0"
        />
      </div>
    </div>
  );
};

export default AddAddress;
