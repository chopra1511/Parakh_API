// scripts/seedProducts.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");

// Connect to the database using the same URI from your environment variables
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected for seeding");
    seedProducts();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Read the dummy data from the JSON file
const productsFilePath = path.join(__dirname, "data", "products.json");
const productsData = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

// Function to seed products into the database
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // Clear existing products if needed
    await Product.insertMany(productsData);
    console.log("Products seeded successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};
