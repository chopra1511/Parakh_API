const Product = require("../models/Product");
const Wishlist = require("../models/wishlist");
const User = require("../models/user");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const product = await Product.findById(productId);
    res.status(200).json({ message: "Get product details successfully", data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;

  try {
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user by ID
    const user = await User.findById(userID).populate("wishlist");

    let wishlist = await Wishlist.findOne({ userID: userID });

    if (!wishlist) {
      wishlist = new Wishlist({ userID: userID, wishlist: [] });
      user.wishlist = wishlist._id;
      await wishlist.save();
      await user.save();
    }

    const existingItemIndex = wishlist.wishlist.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex === -1) {
      wishlist.wishlist.push({ product: foundProduct._id, isWishlist: true });
      await wishlist.save();
      return res.status(200).json({
        message: "Product added to wishlist",
        wishlist: wishlist,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Product is already in wishlist" });
    }

  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userID });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const productIndex = wishlist.wishlist.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      wishlist.wishlist.splice(productIndex, 1);

      if (wishlist.wishlist.length === 0) {
        await Wishlist.deleteOne({ _id: wishlist._id });
        await User.updateOne(
          { _id: userID },
          { $unset: { wishlist: "" } }
        );

        return res.status(200).json({
          message: "Wishlist deleted as it was empty",
          wishlist: wishlist,
        });
      } else {
        await wishlist.save();

        return res.status(200).json({
          message: "Product removed from wishlist",
          wishlist: wishlist,
        });
      }
    } else {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getUserWishlist = async (req, res) => {
  const userID = req.session.user._id;

  try {
    const user = await User.findById(userID).populate({
      path: "wishlist",
      populate: {
        path: "wishlist.product",
        model: "Product",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWishlist = user.wishlist;
    res.status(200).json({
      message: "User Wishlist retrieved successfully",
      wishlist: userWishlist,
    });
  } catch (error) {
    console.error("Error retrieving user wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
};
