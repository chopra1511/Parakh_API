const Order = require("../models/order");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
