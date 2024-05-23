"use strict";
const express = require("express");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
const app = express();
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

//const route
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// api routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.use(errorHandler);
app.listen(process.env.PORT, () => {
   console.log(`Server started on port ${process.env.PORT}`);
});
