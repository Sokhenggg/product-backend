const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
   },
   name: {
      type: String,
      required: true,
   },
   brand: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   availableForSell: {
      type: Boolean,
      default: false,
   },
});

module.exports = mongoose.model("Product", productSchema);
