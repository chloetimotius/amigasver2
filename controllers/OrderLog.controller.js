const { createOrder, getOrdersByUser, getOrderById } = require("../models/OrderLog.model.js");
const PDFDocument = require("pdfkit");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.placeOrder = async (req, res) => {
  try {
    const userId = req.authUser.id;
    const { items, finalTotal } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // USE FINAL CHECKOUT TOTAL (not subtotal)
    const total = Number(finalTotal);
    const coinsEarned = Math.floor(total / 5);

    const order = await createOrder(
      userId,
      items,
      total,
      coinsEarned
    );

    res.json(order);

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};


exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.authUser.id;

    const orders = await getOrdersByUser(userId);

    res.json(orders);
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};



//for pdf generating
exports.downloadReceipt = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId =
  req.user?.id ||
  req.session?.user?.id ||
  req.session?.userId;


    // ✅ Fetch order with items + product
    const order = await prisma.order.findFirst({
      where: {
    id: orderId,
    userId: userId, // security: user owns order
  },
  include: {
    user: true,                 //  user.email
    deliveryOption: true,       //  delivery fee lives here
    items: {
      include: {
        product: true,          //  product name, price
      },
    },
  },
});


    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    

    // ================= PDF =================
    const doc = new PDFDocument({ margin: 50 });
res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "inline; filename=Receipt.pdf");
doc.pipe(res);

// ===== Header =====
doc
  .fontSize(20)
  .font("Helvetica-Bold")
  .text("QuickMart Receipt", { align: "center" });

doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

// ===== Order Info =====
doc.fontSize(11).font("Helvetica");

doc.text(`Order ID: ${order.id}`);
doc.text(`Email: ${order.user.email}`);

const date = new Date(order.createdAt);
doc.text(`Date: ${date.toDateString()}`);
doc.text(
  `Time: ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
);

doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

// ===== Items =====
doc.font("Helvetica-Bold").text("Items");
doc.moveDown(0.5);
doc.font("Helvetica");

let subtotal = 0;

order.items.forEach((item) => {
  const lineTotal = item.quantity * item.price;
  subtotal += lineTotal;

  doc.text(
    `${item.product.name} x${item.quantity}`,
    { continued: true }
  );
  doc.text(`$${lineTotal.toFixed(2)}`, { align: "right" });
});

doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

// ===== Totals =====
doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: "right" });

doc
  .fontSize(9)
  .fillColor("gray")
  .text("Delivery fee calculated at checkout", { align: "right" });

  doc.fillColor("black");


doc
  .font("Helvetica-Bold")
  .fontSize(13)
  .text(`Total: $${order.total.toFixed(2)}`, { align: "right" });

doc.moveDown(2);

// ===== Footer =====
doc
  .fontSize(10)
  .font("Helvetica")
  .text("Thank you for shopping with QuickMart!", { align: "center" });

doc.end();

  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};
