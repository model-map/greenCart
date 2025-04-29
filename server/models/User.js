/*  
The code imports the Mongoose library for MongoDB interactions.  

It defines a Mongoose schema named `userSchema` with fields for `name`, `email`, `password`, and `cartItems`. 
The `name`, `email`, and `password` fields are required, with `email` also being unique. 
The `cartItems` field is an object with a default value of an empty object. 
Schema options include `{ minimize: false }` to prevent Mongoose from removing empty objects.  

A Mongoose model named `User` is created or retrieved using `mongoose.models.user` to avoid redefining the model if it already exists.  

Finally, the `User` model is exported as the default export for use in other parts of the application.  
*/

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
