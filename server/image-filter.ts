/**
 * Advanced Image Content Analysis and Filtering System
 * Removes Japanese promotional banners and catalog images
 */

export function filterAuthenticVehicleImages(images: string[]): string[] {
  if (!Array.isArray(images)) return [];

  console.log(`Filtering ${images.length} images for promotional content...`);

  const authenticImages = images.filter((imageUrl: string) => {
    if (!imageUrl || !imageUrl.startsWith('http')) return false;
    
    // Must be a valid image format
    if (!(imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png') || imageUrl.includes('.webp'))) {
      return false;
    }

    // Decode URL to catch encoded Japanese characters
    const decodedUrl = decodeURIComponent(imageUrl);
    const lowerUrl = imageUrl.toLowerCase();

    // Remove images with Japanese promotional text
    const japanesePromoKeywords = [
      'オークション',     // Auction
      'キャンペーン',     // Campaign  
      'LINE',            // LINE messaging
      'セール',          // Sale
      'クーポン',        // Coupon
      '万円',            // 10,000 yen
      'プレゼント',      // Present/Gift
      '記念',            // Memorial/Anniversary
      'オープン',        // Open
      '限定',            // Limited
      '特典'             // Special benefit
    ];

    // Check for Japanese promotional content
    for (const keyword of japanesePromoKeywords) {
      if (decodedUrl.includes(keyword) || imageUrl.includes(keyword)) {
        console.log(`Filtered promotional image: ${keyword} found in ${imageUrl.substring(0, 80)}...`);
        return false;
      }
    }

    // Remove common promotional image patterns
    const promoPatterns = [
      'englishNR.jpg',
      'E2301R6',
      'promo',
      'campaign', 
      'banner',
      'advertisement',
      'ad_',
      '_ad',
      'fb_image',
      'common/other/',
      'special',
      'offer',
      'deal',
      'sale'
    ];

    for (const pattern of promoPatterns) {
      if (lowerUrl.includes(pattern.toLowerCase()) || decodedUrl.includes(pattern)) {
        console.log(`Filtered promotional pattern: ${pattern} in ${imageUrl.substring(0, 80)}...`);
        return false;
      }
    }

    // For Goo-net images, use advanced pattern detection
    if (imageUrl.includes('goo-net.com') || imageUrl.includes('picture1.goo-net.com')) {
      // Promotional banners often have specific URL structures
      // Keep only authentic vehicle inspection photos with W00 pattern
      if (!imageUrl.includes('W00')) {
        console.log(`Filtered non-inspection Goo-net image: ${imageUrl.substring(0, 80)}...`);
        return false;
      }

      // Filter out promotional banner patterns (they often have specific ID structures)
      if (imageUrl.match(/[A-Z]\d{7}[A-Z]\d{8}[A-Z]\d{5}\.jpg/)) {
        console.log(`Filtered promotional banner pattern: ${imageUrl.substring(0, 80)}...`);
        return false;
      }
    }

    // Additional filtering for catalog/dealer promotional images
    if (imageUrl.includes('catalog') || 
        imageUrl.includes('dealer') ||
        imageUrl.includes('showroom') ||
        imageUrl.includes('logo') ||
        imageUrl.includes('watermark')) {
      console.log(`Filtered catalog/dealer image: ${imageUrl.substring(0, 80)}...`);
      return false;
    }

    return true;
  });

  const filteredCount = images.length - authenticImages.length;
  console.log(`Image filtering complete: ${filteredCount} promotional images removed, ${authenticImages.length} authentic images retained`);

  // Return up to 10 authentic vehicle images
  return authenticImages.slice(0, 10);
}