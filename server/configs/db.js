/*  
The code imports the mongoose library.

It defines an asynchronous function named connectDB. Inside the function, an event listener is added to log a message when the database connection is successfully established.  

The function then attempts to connect to a MongoDB database using the MONGODB_URI environment variable and specifies "greencart" as the database name.  

If an error occurs during the connection process, it catches the error and logs the error message to the console.  

Finally, the connectDB function is exported as the default export of the module.  
*/

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(`Database Connected`);
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
  } catch (error) {
    console.error(error.message);
  }
};

export default connectDB;
