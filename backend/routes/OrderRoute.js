const express = require("express");
const {
  createOrder,
  getSingleOrder,
  myOrder,
  getAllorders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/OrderControllers");
const router = express.Router();
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
router.route("/order/new").post(isAuthenticatedUser, createOrder);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizedRoles("admin"), getAllorders);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrder);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateOrderStatus)
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

module.exports = router;
