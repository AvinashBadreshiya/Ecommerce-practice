const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { USER_TYPE: { ADMIN } } = require("../json/enums.json");

const userController = require("../controllers/user/user.controller")

router.post("/signup", userController.signUp.validate, userController.signUp.handler);
router.post("/signin", userController.signIn.validate, userController.signIn.handler);

module.exports = router;
