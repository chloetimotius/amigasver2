const prisma = require("./prismaClient.js");

// Create a new order
async function createOrder(userId, items, total, coinsEarned) {
  return prisma.order.create({
    data: {
      userId,
      total,
      coinsEarned,
      items: {
        create: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      }
    },
    include: { items: true }
  });
}


// Get all orders for a user
async function getOrdersByUser(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

module.exports = {
  createOrder,
  getOrdersByUser,
};




//for pdf generating
exports.getOrderWithItems = async (orderId) => {
  return prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });
};