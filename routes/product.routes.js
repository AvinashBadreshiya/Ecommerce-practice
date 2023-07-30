const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { USER_TYPE: { VENDOR, SUPERADMIN } } = require("../json/enums.json");

const productController = require("../controllers/product/product.controller");

// POST Method
router.post("/addProduct", auth({ usersAllowed: [VENDOR] }), productController.addProduct.validate, productController.addProduct.handler);

// GET Method
router.get("/getProductForVendor", auth({ usersAllowed: [VENDOR] }), productController.getProductForVendor.validate, productController.getProductForVendor.handler);
router.get("/getProductForUser", productController.getProductForUser.validate, productController.getProductForUser.handler);
router.get("/getProductForSuperAdmin", auth({ usersAllowed: [SUPERADMIN] }), productController.getProductForSuperAdmin.validate, productController.getProductForSuperAdmin.handler);

// PUT Method
router.put("/updateProduct", auth({ usersAllowed: [VENDOR] }), productController.updateProduct.validate, productController.updateProduct.handler);
router.put("/approveProduct", auth({ usersAllowed: [SUPERADMIN] }), productController.approveProduct.validate, productController.approveProduct.handler);

// DELETE Method
router.delete("/deleteProduct", auth({ usersAllowed: [VENDOR, SUPERADMIN] }), productController.deleteProduct.validate, productController.deleteProduct.handler);

module.exports = router;
