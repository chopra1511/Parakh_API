// routes/cart.js
const express = require("express");
const { addItemToCart, getUserCart, decreaseItemCart, increaseItemCart, deleteItemFromCart, clearCart } = require("../controller/Cart");

const router = express.Router();

router.post("/add-to-cart", addItemToCart);

router.post("/increase-cart-item", increaseItemCart);

router.post("/decrease-cart-item", decreaseItemCart);

router.post("/delete-cart-item", deleteItemFromCart);

router.get("/get-cart", getUserCart);

router.delete("/clear-cart", clearCart);



exports.routes = router;
