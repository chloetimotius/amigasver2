const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            subcategory: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    const formattedWishlist = wishlistItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      category: item.product.subcategory?.category?.name || 'General',
      addedAt: item.addedAt
    }));

    res.json(formattedWishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId)
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId: Number(productId)
      }
    });

    res.status(201).json({
      message: 'Added to wishlist',
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const deleted = await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId)
        }
      }
    }).catch(() => null);

    if (!deleted) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.json({ inWishlist: false });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId)
        }
      }
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
};

// Sync wishlist from localStorage to database
exports.syncWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { localWishlist } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!Array.isArray(localWishlist)) {
      return res.status(400).json({ error: 'Invalid wishlist data' });
    }

    // Get existing wishlist from database
    const existingItems = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true }
    });

    const existingProductIds = existingItems.map(item => item.productId);

    // Find items to add (in local but not in database)
    const itemsToAdd = localWishlist
      .map(id => Number(id))
      .filter(productId => !existingProductIds.includes(productId));

    // Verify products exist before adding
    if (itemsToAdd.length > 0) {
      const validProducts = await prisma.product.findMany({
        where: { id: { in: itemsToAdd } },
        select: { id: true }
      });

      const validProductIds = validProducts.map(p => p.id);

      // Add new items
      const newItems = validProductIds.map(productId => ({
        userId,
        productId
      }));

      if (newItems.length > 0) {
        await prisma.wishlistItem.createMany({
          data: newItems,
          skipDuplicates: true
        });
      }
    }

    // Return merged wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true
          }
        }
      }
    });

    res.json({
      message: 'Wishlist synced',
      wishlist: wishlist.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl
      }))
    });
  } catch (error) {
    console.error('Error syncing wishlist:', error);
    res.status(500).json({ error: 'Failed to sync wishlist' });
  }
};
