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

// Create an HTTP server
const server = require("http").createServer(app);

// Set up Socket.IO
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Make the io instance available in routes
app.set("socketio", io);

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log("Session store error:", error);
});

app.use(
  cors({
    origin: ["https://chopra1511.github.io", "http://localhost:5174"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.sendStatus(200);
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set("trust proxy", true);

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

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Connected! and running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Socket.IO connection handling (optional)
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
