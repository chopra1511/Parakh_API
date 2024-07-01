require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const authRoutes = require("./routes/auth");
const storeRoutes = require("./routes/store");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");

const PORT = process.env.PORT || 8000;

const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log("Session store error:", error);
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.JWT_SECRET || "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(authRoutes.routes);
app.use(storeRoutes.routes);
app.use(cartRoutes.routes);
app.use(paymentRoutes.routes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected! and running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
