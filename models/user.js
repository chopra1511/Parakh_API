const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authSchema = new Schema({
  name: { type: String, required: true },
  contact: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cart" }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" }],
});

module.exports = mongoose.model("Auth", authSchema);
