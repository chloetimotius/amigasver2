const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orderTracking.controller");

// Get all orders for logged-in user
router.get("/", ordersController.getUserOrders);

// Get tracking info for a single order
router.get("/:orderId", ordersController.getOrderTracking);

// Admin: update order status
router.put("/:orderId/status", ordersController.updateOrderStatus);

module.exports = router;
