const { Cashfree } = require("cashfree-pg");
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
  return orderId.substr(0, 12);
};

exports.cartCheckout = async (req, res) => {
  try {
   var request = {
     order_amount: 1.0,
     order_currency: "INR",
     order_id: await generateOrderId(),
     customer_details: {
       customer_id: "walterwNrcMi",
       customer_phone: "8474090589",
       customer_name: "Walter White",
       customer_email: "walter.white@example.com",
     },
     order_meta: {
       payment_methods: "cc,dc,upi",
     },
   };

   Cashfree.PGCreateOrder("2023-08-01", request)
     .then((response) => {
         console.log(
           "Order created successfully:",
           response.data
         );
         res.status(200).json(response.data);
     })
     .catch((error) => {
       console.error("Error:", error.response.data.message);
     });
  } catch (error) {
    console.log(error);
  }
};

exports.paymentVerify = async (req, res) => {
    const {orderId} = req.body
try {
    Cashfree.PGOrderFetchPayments("2023-08-01", orderId).then((result) => {
        console.log("Order fetched successfully:", result.data);
        res.status(200).json(result.data);
    }).catch((err) => {
        console.error("Error:", err.response.data.message);
    });
} catch (error) {
    console.log(error);
}        
};
