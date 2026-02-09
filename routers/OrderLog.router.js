const express = require("express");
const router = express.Router();
const resolveUser = require("./resolveUser");

const {
  placeOrder,
  getOrderHistory,
  downloadReceipt,
} = require("../controllers/OrderLog.controller.js");

// POST /orders → place order
router.post("/", resolveUser, placeOrder);

// GET /orders/my → get user's order history
router.get("/my", resolveUser, getOrderHistory);

//add pdf feature
router.get("/:orderId/receipt", resolveUser, downloadReceipt);

module.exports = router;
