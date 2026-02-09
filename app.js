const express = require('express');
const createError = require('http-errors');
const session = require('express-session');

const somethingRouter = require('./routers/Something.router.js');
const personRouter = require('./routers/Person.router.js');
const OrderLogRouter = require('./routers/OrderLog.router.js');
const reviewRouter = require('./routers/Reviews.router.js');
const OrderTrackingRouter = require("./routers/orderTracking.router.js");
const recipeRouter = require('./routers/Recipe.router.js');
const path = require('path');

const app = express();
app.use(express.json());

// Session middleware (required for `req.session` used by Auth.router)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/somethings', somethingRouter);
app.use('/persons', personRouter);
app.use('/orders', OrderLogRouter);
app.use("/api/orders", OrderTrackingRouter);
app.use('/api/recipes', recipeRouter);


const authRouter = require('./routers/Auth.router.js');
app.use('/auth', authRouter);

// JWT Authentication Routes
const { jwtAuthRouter } = require('./routers/JWTAuth.router.js');
app.use('/auth', jwtAuthRouter);

const profileRouter = require('./routers/Profile.router.js');
const profileJWTRouter = require('./routers/ProfileJWT.router.js');
const profileImageRouter = require('./routers/ProfileImage.router.js');
const categoryRoutes = require('./routers/Category.router.js');
const subcategoryRoutes = require('./routers/Subcategory.router.js');
const productRoutes = require('./routers/Product.router.js');

app.use('/profile', profileRouter);
app.use('/profile', profileJWTRouter); // JWT-enhanced profile routes
app.use('/profile-image', profileImageRouter);
app.use('/categories', categoryRoutes);
app.use('/subcategories', subcategoryRoutes);
app.use('/products', productRoutes);

app.use("/delivery-options", require("./routers/Delivery.router.js"));

// Review routes
app.use('/api', reviewRouter);

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

const wishlistRoutes = require('./routers/Wishlist.router');
app.use('/api/wishlist', wishlistRoutes);

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.message || 'Unknown Server Error!' });
});

module.exports = app;