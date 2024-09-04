const { Cashfree } = require("cashfree-pg");
const Order = require("../models/order");
const crypto = require("crypto");
require("dotenv").config();

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

const generateOrderId = () => {
  const uniqueID = crypto.randomBytes(16).toString("hex");

  const hash = crypto.createHash("sha256");
  hash.update(uniqueID);

  const orderId = hash.digest("hex");
  return orderId.substr(0, 4);
};

exports.cartCheckout = async (req, res) => {
  const { orderDetails } = req.body;
  console.log(orderDetails);
  try {
    const order = {
      order_amount: orderDetails.amount,
      order_currency: "INR",
      order_id: await generateOrderId(),
      customer_details: {
        customer_id: orderDetails.customer.name,
        customer_phone: orderDetails.customer.contact.toString(),
        customer_name: orderDetails.customer.name,
        customer_email: orderDetails.customer.email,
      },
      order_meta: {
        payment_methods: "cc,dc,upi",
      },
    };

    Cashfree.PGCreateOrder("2023-08-01", order)
      .then(async (response) => {
        if (response && response.data) {
          // console.log("Order created successfully:", response.data);

          // Save the order to the database
          const newOrder = new Order({
            order_details: orderDetails,
            order_created: response.data,
            order_updated: "",
            order_tracking: ""
          });

          await newOrder.save();

          // Emit event to all clients
          const io = req.app.get("socketio");
          io.emit("orderCreated", newOrder);

          res.status(200).json(response.data);
        } else {
          throw new Error("Invalid response from Cashfree API");
        }
      })
      .catch((error) => {
        console.error("Error:", error.message || error.response?.data?.message);
        res.status(500).json({
          message: "Order creation failed",
          error: error.message || error.response?.data?.message,
        });
      });
  } catch (error) {
    console.log("Server error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.paymentVerify = async (req, res) => {
  const { orderId } = req.body;
  try {
    Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
      .then(async (result) => {
        if (result && result.data) {
          // console.log("Order fetched successfully:", result.data);

          // Find the order by order_id and update order_updated field
          const updatedOrder = await Order.findOneAndUpdate(
            { "order_created.order_id": orderId },
            {
              order_updated: result.data,
              order_tracking: {
                confirmedOrder: false,
                processingOrder: false,
                productDispatched: false,
                productDelivered: false,
              },
            },
            { new: true } // returns the updated document
          );

          // Emit event to all clients
          const io = req.app.get("socketio");
          io.emit("orderUpdated", updatedOrder);

          res.status(200).json(result.data);
        }
      })
      .catch((err) => {
        console.error("Error:", err.response.data.message);
        res
          .status(500)
          .json({
            message: "Payment verification failed",
            error: err.response.data.message,
          });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

