// models/product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  image: { type: String, required: true },
  name: { type: String, required: true },
  SKU_ID: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: null },
  category: { type: String, required: true },
  variant: {
    color: { type: String, required: true },
    material: { type: String, required: true },
  },
  mostLoved: { type: Boolean, required: true },
  wishlist: { type: Boolean, required: true },
  available: { type: Boolean, required: true },
  stock: { type: Number, required: true },
  rating: {
    rate: { type: Number, required: true },
    count: { type: Number, required: true },
  },
});

module.exports = mongoose.model("Product", productSchema);
