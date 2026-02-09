const prisma = require("../models/prismaClient");

// GET all delivery options
exports.getDeliveryOptions = async (req, res) => {
  try {
    const options = await prisma.deliveryOption.findMany();
    res.json(options);
  } catch (err) {
    console.error("Error fetching delivery options:", err);
    res.status(500).json({ error: "Failed to fetch delivery options" });
  }
};

