const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        totalPrice: { type: Number, required: true },
        totalDiscount: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

module.exports = mongoose.model("Cart", cartSchema);
