const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  order_details: {
    type: Object,
    required: true,
  },
  order_created: {
    type: Object,
    required: true,
  },
  order_updated: {
    type: Object,
    required: true,
  },
  order_tracking: {
    type: Object,
  },
});

module.exports = mongoose.model("Order", orderSchema);
