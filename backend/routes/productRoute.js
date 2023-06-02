const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProudct,
  getSingleProducts,
  createOrUpdateReview,
  getAllReviews,
  delteReviews,
} = require("../controllers/productControllers");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

router.route("/products").get(getAllProducts);
router
  .route("/admin/products/new")
  .post(isAuthenticatedUser, authorizedRoles("admin"), createProduct);
router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizedRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteProudct);

router.route("/products/:id").get(getSingleProducts);

router.route("/review").put(isAuthenticatedUser, createOrUpdateReview);

router
  .route("/reviews")
  .get(getAllReviews)
  .delete(isAuthenticatedUser, delteReviews);

module.exports = router;
