const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { USER_TYPE } = require("../json/enums.json");
const roleController = require("../controllers/role/role.controller")

router.post("/createRole", auth({ usersAllowed: [USER_TYPE.SUPERADMIN], isTokenRequired: false }), roleController.createRole.validate, roleController.createRole.handler);
router.get("/getRole", roleController.getRole.handler);

module.exports = router;
