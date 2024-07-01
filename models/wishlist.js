const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  wishlist:  [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
