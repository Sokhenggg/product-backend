const asyncHandler = require("express-async-handler");

//middleware
const {
   BadRequestError,
   UnauthorizedError,
} = require("../middleware/errorMiddleware");

//model
const Product = require("../models/productModel");

// @desc Create a new product
// @route POST /api/products/create
// @access Private
const createProduct = asyncHandler(async (req, res) => {
   const { name, brand, price, availableForSell } = req.body;

   if (!name || !brand || !price || !availableForSell) {
      throw new BadRequestError("Please in all fields");
   }

   const product = await Product.create({
      user: req.user._id,
      name,
      brand,
      price,
      availableForSell,
   });

   if (product) {
      res.status(201).json({
         _id: product._id,
         user: product.user,
         name: product.name,
         brand: product.brand,
         price: product.price,
         availableForSell: product.availableForSell,
      });
   } else {
      throw new BadRequestError("Invalid product data");
   }
});

// @desc Update a product
// @route PUT /api/products/:id
// @access Private
const updateProduct = asyncHandler(async (req, res) => {
   const { id } = req.params;
   const { name, brand, price, availableForSell } = req.body;

   if (!name || !brand || !price || !availableForSell) {
      throw new BadRequestError("Please fill in the product");
   }

   if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
   }

   const product = await Product.findById(id);

   if (product.user.toString() !== req.user.id.toString()) {
      throw new UnauthorizedError("Unauthorized");
   }

   if (product) {
      product.name = name;
      product.brand = brand;
      product.price = price;
      product.availableForSell = availableForSell;

      const updatedProduct = await product.save();

      res.json(updatedProduct);
   } else {
      throw new BadRequestError("Product not found");
   }
});

// @desc DELETE product
// @route DELETE /api/products/:id
// @access Private
const deleteProduct = asyncHandler(async (req, res) => {
   const { id } = req.params;

   if (!req.user) {
      throw new UnauthorizedError("Unauthorized access");
   }

   const product = await Product.findByIdAndDelete(id);

   if (product.user.toString() !== req.user.id.toString()) {
      throw new UnauthorizedError("Unauthorized access");
   }

   if (product) {
      res.json({ message: "Product removed" });
   } else {
      throw new BadRequestError("Invalid Product data");
   }
});

// @desc Get All product by user id
// @route GET /api/products/:id
// @access Private
const getProductsByUserId = asyncHandler(async (req, res) => {
   const { id } = req.params;

   if (!id) {
      throw new BadRequestError("Invalid user id");
   }

   try {
      const products = await Product.find({ user: id });

      res.json(products);
   } catch (error) {
      throw new BadRequestError("Invalid user id");
   }
});

// @desc Get All product
// @route GET /api/products
// @access Public

const getAllProducts = asyncHandler(async (req, res) => {
   const products = await Product.find({});
   res.json(products);
});

module.exports = {
   createProduct,
   updateProduct,
   deleteProduct,
   getProductsByUserId,
   getAllProducts,
};
