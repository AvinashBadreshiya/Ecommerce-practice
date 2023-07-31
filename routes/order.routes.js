const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { USER_TYPE: { USER, VENDOR, SUPERADMIN } } = require("../json/enums.json");

const orderController = require("../controllers/order/order.controller");

// POST Method
router.post("/createOrder", auth({ usersAllowed: [USER] }), orderController.createOrder.validate, orderController.createOrder.handler);

// GET Method
// router.get("/getOrderForUser", auth({ usersAllowed: [USER] }), orderController.getOrderForUser.handler);
// router.get("/getOrderForVendor", auth({ usersAllowed: [VENDOR] }), orderController.getOrderForVendor.validate, orderController.getOrderForVendor.handler);
// router.get("/getOrderForSuperAdmin", auth({ usersAllowed: [SUPERADMIN] }), orderController.getOrderForSuperAdmin.validate, orderController.getOrderForSuperAdmin.handler);

// PUT Method
// router.put("/updateOrder", auth({ usersAllowed: [SUPERADMIN] }), orderController.updateOrder.validate, orderController.updateOrder.handler);

module.exports = router;
