const Product = require("../models/Product");
const Wishlist = require("../models/wishlist");
const User = require("../models/user");

exports.getProducts = async (req, res) => {
    try {
    const products = await Product.find();
    res.status(200).json({
    message: "Get products successfully",
    data: products,
  });
  } catch (err) {
    res.status(500).json({ message: err.message });
    }
};

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;
    console.log(productId);

  try {
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(foundProduct);

    // Find the user by ID
    const user = await User.findById(userID).populate("wishlist");

    let wishlist = await Wishlist.findOne({ userID: userID });

    if (!wishlist) {
        wishlist = new Wishlist({ userID: userID, wishlist: [] });
         await wishlist.save();
         user.cart = wishlist._id;
         await user.save();
    }

    const existingItemIndex = wishlist.wishlist.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex === -1) {
      wishlist.wishlist.push({ product: foundProduct._id });
      await wishlist.save();
      res.status(200).json(wishlist);
    } else {
      res.status(400).json({ message: "Product is already in wishlist" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userID: userID });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const productIndex = wishlist.wishlist.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      wishlist.wishlist.splice(productIndex, 1);
      await wishlist.save();
      res
        .status(200)
        .json({ message: "Product removed from wishlist", wishlist: wishlist });
    } else {
      res.status(404).json({ message: "Product not found in wishlist" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserWishlist = async (req, res) => {
  const userID = req.session.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userID: userID }).populate(
      "wishlist.product"
    );
    console.log(wishlist);
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
