const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');

/**
 * Create a new user with hashed password
 */
async function createUser({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
}

/**
 * Find user by email
 */
function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find user by ID
 */
function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Get user profile by ID
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      bio: true,
      profileImage: true,
      createdAt: true
    }
  });
  return user;
}

/**
 * Update user profile
 */
async function updateUserProfile(userId, { name, email, phone, address, bio, profileImage }) {
  const updateData = { name, email };
  
  // Add optional fields if provided
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (bio !== undefined) updateData.bio = bio;
  if (profileImage !== undefined) updateData.profileImage = profileImage;
  
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      bio: true,
      profileImage: true,
      createdAt: true
    }
  });
}

/**
 * Change user password
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return false;

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) return false;

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  return true;
}

/**
 * Get user analytics
 */
async function getUserAnalytics(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  subcategory: {
                    select: {
                      category: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      wishlistItems: {
        select: {
          id: true
        }
      }
    }
  });

  if (!user) return null;

  const now = new Date();
  const memberSince = user.createdAt;
  
  // Calculate order statistics
  const totalOrders = user.orders.length;
  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  
  // Calculate recent activity (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = user.orders.filter(order => order.createdAt >= thirtyDaysAgo);
  
  // Calculate favorite category based on order frequency
  const categoryCount = {};
  user.orders.forEach(order => {
    order.items.forEach(item => {
      const categoryName = item.product.subcategory.category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + item.quantity;
    });
  });
  
  // Find the most ordered category
  const favoriteCategory = Object.keys(categoryCount).length > 0 
    ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
    : 'N/A';
  
  return {
    memberSince,
    totalOrders,
    totalSpent: Math.round(totalSpent * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    recentOrdersCount: recentOrders.length,
    wishlistItemsCount: user.wishlistItems.length,
    membershipLevel: getMembershipLevel(totalSpent, totalOrders),
    favoriteCategory: favoriteCategory
  };
}

/**
 * Get recent user orders
 */
async function getRecentOrders(userId, limit = 5) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      }
    }
  });
}

/**
 * Determine membership level based on spending and orders
 */
function getMembershipLevel(totalSpent, totalOrders) {
  if (totalSpent >= 1000 || totalOrders >= 50) {
    return 'Gold';
  } else if (totalSpent >= 500 || totalOrders >= 20) {
    return 'Silver';
  } else if (totalSpent >= 100 || totalOrders >= 5) {
    return 'Bronze';
  }
  return 'New Member';
}

module.exports = {
  createUser,
  getUserByEmail,  getUserById,  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAnalytics,
  getRecentOrders,
};
