const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { USER_TYPE: { USER } } = require("../json/enums.json");

const cartController = require("../controllers/cart/cart.controller");

// POST Method
router.post("/addToCart", auth({ usersAllowed: [USER] }), cartController.addToCart.validate, cartController.addToCart.handler);

// GET Method
router.get("/getCart", auth({ usersAllowed: [USER] }), cartController.getCart.handler);

// PUT Method
router.put("/updateCart", auth({ usersAllowed: [USER] }), cartController.updateCart.validate, cartController.updateCart.handler);

// DELETE Method
router.delete("/deleteCart", auth({ usersAllowed: [USER] }), cartController.deleteCart.validate, cartController.deleteCart.handler);

module.exports = router;
