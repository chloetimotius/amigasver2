const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

module.exports = function resolveUser(req, res, next) {
  // --- 1️⃣ Check session auth ---
  if (req.session && req.session.userId) {
    req.authUser = {
      id: req.session.userId,
      name: req.session.userName
    };
    return next();
  }

  // --- 2️⃣ Check JWT auth ---
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.authUser = {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email
      };
      return next();
    } catch (err) {
      // Ignore invalid token
    }
  }

  // --- 3️⃣ No auth found ---
  return res.status(401).json({ error: "User not logged in" });
};
