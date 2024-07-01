const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  addresses: {
    addressList: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        contact: { type: Number, required: true },
        pincode: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
      },
    ],
  },
});


module.exports = mongoose.model("Address", addressSchema);
