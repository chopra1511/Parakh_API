const express = require("express");
const { cartCheckout, paymentVerify } = require("../controller/Payment");
const router = express.Router();

router.post("/cart-checkout", cartCheckout);

router.post("/payment-verify", paymentVerify);

exports.routes = router;
