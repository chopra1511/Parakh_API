const express = require("express");
const { addUserAddress, getUserAddresses, removeUserAddress } = require("../controller/Address");
const { getProducts, addToWishlist, removeFromWishlist, getUserWishlist } = require("../controller/ProductController");

const router = express.Router();


router.get("/get-products", getProducts);

router.post("/add-address", addUserAddress);

router.post("/remove-address", removeUserAddress);

router.get("/get-address", getUserAddresses);

router.post("/add-to-wishlist", addToWishlist);

router.post("/remove-from-wishlist", removeFromWishlist);

router.get("/get-wishlist", getUserWishlist);


exports.routes = router;
