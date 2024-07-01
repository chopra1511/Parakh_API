const Cart = require("../models/cart");
const Product = require("../models/Product");
const User = require("../models/user");

exports.addItemToCart = async (req, res) => {
  const { product } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if the product exists
    const foundProduct = await Product.findById(product._id);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userID = req.session.user._id;

    // Find the user by ID
    const user = await User.findById(userID).populate("cart");

    // Find the user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({ userID: userID });

    if (!cart) {
      cart = new Cart({ userID: userID, cart: { items: [] } });
      await cart.save();
      user.cart = cart._id;
      await user.save();
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.cart.items.findIndex(
      (item) => item.product.toString() === product._id
    );

    if (existingItemIndex >= 0) {
      // If the product exists, update the quantity
      cart.cart.items[existingItemIndex].quantity += 1;
      cart.cart.items[existingItemIndex].totalPrice += foundProduct.price;
      cart.cart.items[existingItemIndex].totalDiscount +=
        foundProduct.discount || 0;
    } else {
      // If the product does not exist, add it to the cart
      cart.cart.items.push({
        product: foundProduct._id,
        quantity: 1,
        totalPrice: foundProduct.price,
        totalDiscount: foundProduct.discount || 0,
      });
    }

    // Save the cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.increaseItemCart = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;
  try {
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
      }

    // Find the user's cart and populate the product details
    const cart = await Cart.findOne({ userID: userID }).populate(
      "cart.items.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (existingItemIndex >= 0) {
      const existingItem = cart.cart.items[existingItemIndex];

      // Increase the quantity
      existingItem.quantity += 1;
      existingItem.totalPrice += foundProduct.price;
      existingItem.totalDiscount += foundProduct.discount || 0;

      // Save the updated cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.decreaseItemCart = async (req, res) => {
  const { productId } = req.body;
  const userID = req.session.user._id;

  try {
    const foundProduct = await Product.findById(productId);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's cart and populate the product details
    const cart = await Cart.findOne({ userID: userID }).populate(
      "cart.items.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (existingItemIndex >= 0) {
      const existingItem = cart.cart.items[existingItemIndex];

      // Decrease the quantity or remove the item if quantity reaches zero
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        existingItem.totalPrice -= foundProduct.price;
        existingItem.totalDiscount -= foundProduct.discount || 0;
      } else {
        cart.cart.items.splice(existingItemIndex, 1);
      }

      // Save the updated cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItemFromCart = async (req, res) => {
  const { productId } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userID = req.session.user._id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userID: userID }).populate(
      "cart.items.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the product in the cart
    const existingItemIndex = cart.cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Remove the item from the cart
      cart.cart.items.splice(existingItemIndex, 1);

      // Save the updated cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  const userID = req.session.user._id;

  try {
    // Find the cart for the given user
    const cart = await Cart.findOne({ userID: userID });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear the items in the cart
    cart.cart.items = [];

    // Save the updated cart
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while clearing the cart" });
  }
};

exports.getUserCart = async (req, res) => {
  const userID = req.session.user._id;

  try {
    // Find the user by ID and populate the addresses field
    const user = await User.findById(userID).populate({
      path: "cart",
      populate: {
        path: "cart.items.product",
        model: "Product",
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract addresses from populated user document
    const userCart = user.cart;
    
    res.status(200).json({
      message: "User Cart retrieved successfully",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
