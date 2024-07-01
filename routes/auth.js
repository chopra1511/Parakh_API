const express = require("express");
const { userRegister, userLogIN, userLogout, getUser } = require("../controller/Auth");
const router = express.Router();


router.post("/register", userRegister);

router.post("/login", userLogIN);

router.post("/logout", userLogout);

router.get("/get-user", getUser);

exports.routes = router;
