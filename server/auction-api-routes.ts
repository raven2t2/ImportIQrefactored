import { Router } from 'express';
import { auctionPersistence } from './auction-persistence-service';

const router = Router();

// Get auction listings with filtering and pagination
router.get('/listings', async (req, res) => {
  try {
    const { 
      make, 
      model, 
      sourceSite, 
      search, 
      minPrice, 
      maxPrice, 
      yearFrom, 
      yearTo, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let listings;
    
    if (search) {
      listings = await auctionPersistence.searchAuctionListings(search as string, Number(limit));
    } else if (make && model) {
      listings = await auctionPersistence.getAuctionListingsByMakeModel(make as string, model as string);
    } else {
      listings = await auctionPersistence.getAuctionListings(Number(limit));
    }

    // Apply additional filters if specified
    if (minPrice || maxPrice || yearFrom || yearTo || sourceSite) {
      listings = listings.filter(listing => {
        if (minPrice && parseFloat(listing.price) < Number(minPrice)) return false;
        if (maxPrice && parseFloat(listing.price) > Number(maxPrice)) return false;
        if (yearFrom && listing.year && listing.year < Number(yearFrom)) return false;
        if (yearTo && listing.year && listing.year > Number(yearTo)) return false;
        if (sourceSite && listing.sourceSite !== sourceSite) return false;
        return true;
      });
    }

    // Apply pagination
    const paginatedListings = listings.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginatedListings,
      pagination: {
        total: listings.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < listings.length
      }
    });
  } catch (error) {
    console.error('Error fetching auction listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auction listings'
    });
  }
});

// Get auction statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await auctionPersistence.getActiveAuctionCount();
    const statsBySource = await auctionPersistence.getAuctionStatsBySource();
    
    res.json({
      success: true,
      data: {
        totalActiveListings: totalCount,
        sourceBreakdown: statsBySource,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching auction stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auction statistics'
    });
  }
});

// Search auction listings by query
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const listings = await auctionPersistence.searchAuctionListings(q as string, Number(limit));
    
    res.json({
      success: true,
      data: listings,
      query: q,
      count: listings.length
    });
  } catch (error) {
    console.error('Error searching auction listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search auction listings'
    });
  }
});

// Get listings by make and model
router.get('/make/:make/model/:model', async (req, res) => {
  try {
    const { make, model } = req.params;
    const { limit = 25 } = req.query;
    
    const listings = await auctionPersistence.getAuctionListingsByMakeModel(make, model);
    const limitedListings = listings.slice(0, Number(limit));
    
    res.json({
      success: true,
      data: limitedListings,
      make,
      model,
      count: limitedListings.length,
      totalFound: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings by make/model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings by make and model'
    });
  }
});

// Cleanup old listings (admin endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const cleanedCount = await auctionPersistence.cleanupOldListings(Number(daysOld));
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old listings`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error cleaning up old listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old listings'
    });
  }
});

export { router as auctionApiRoutes };