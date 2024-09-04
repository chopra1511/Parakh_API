const express = require("express");
const { addUserAddress, getUserAddresses, removeUserAddress } = require("../controller/Address");
const { getProducts, addToWishlist, removeFromWishlist, getUserWishlist, getProductDetails } = require("../controller/ProductController");
const { getOrders } = require("../controller/Orders");

const router = express.Router();


router.get("/get-products", getProducts);

router.post("/product-details", getProductDetails);

router.post("/add-address", addUserAddress);

router.post("/remove-address", removeUserAddress);

router.get("/get-address", getUserAddresses);

router.post("/add-to-wishlist", addToWishlist);

router.post("/remove-from-wishlist", removeFromWishlist);

router.get("/get-wishlist", getUserWishlist);

router.get("/get-orders", getOrders);


exports.routes = router;
