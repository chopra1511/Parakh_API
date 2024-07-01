const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.userRegister = async (req, res) => {
  const { name, contact, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      contact,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.isLoggedIn = true;
    req.session.user = newUser;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save error" });
      }

      res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.userLogIN = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save error" });
      }
      res.status(201).json({
        message: "User logged in successfully",
        user,
      });
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

exports.userLogout = async (req, res) => {
  if (!req.session) {
    return res.status(400).json({ message: "No session found" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.getUser = async (req, res) => {
  const userID = req.session.user._id;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
  }
};
