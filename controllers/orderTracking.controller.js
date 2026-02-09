const ordersModel = require("../models/orderTracking.model");

// GET /api/orders
exports.getUserOrders = async (req, res) => {
  // TEMP: no auth yet
  res.status(200).json([
    {
      orderId: 1,
      status: "Packed",
      createdAt: "2026-01-13 10:30"
    },
    {
      orderId: 2,
      status: "Out for Delivery",
      createdAt: "2026-01-14 14:00"
    }
  ]);
};

// GET /api/orders/:orderId
exports.getOrderTracking = async (req, res) => {
  const { orderId } = req.params;

  res.status(200).json({
    orderId,
    status: "Out for Delivery",
    items: [
      { name: "Apple", quantity: 2 },
      { name: "Milk", quantity: 1 }
    ],
    lastUpdated: "2026-01-14 15:20"
  });
};

// PUT /api/orders/:orderId/status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  res.status(200).json({
    message: "Order status updated",
    orderId,
    newStatus: status
  });
};
