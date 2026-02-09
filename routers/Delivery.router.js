const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/Delivery.controller");

// GET /delivery-options
router.get("/", deliveryController.getDeliveryOptions);

module.exports = router;

