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
      'sale',
      'english',
      'service',
      'info',
      'contact',
      'line_',
      'line.',
      'qr_',
      'tel_',
      'phone',
      'website',
      'homepage',
      'link'
    ];

    for (const pattern of promoPatterns) {
      if (lowerUrl.includes(pattern.toLowerCase()) || decodedUrl.includes(pattern)) {
        console.log(`Filtered promotional pattern: ${pattern} in ${imageUrl.substring(0, 80)}...`);
        return false;
      }
    }

    // For Goo-net images, use advanced pattern detection
    if (imageUrl.includes('goo-net.com') || imageUrl.includes('picture1.goo-net.com')) {
      // Filter out promotional banners with specific patterns
      if (imageUrl.includes('englishNR.jpg') || 
          imageUrl.includes('/E23/') ||
          imageUrl.includes('/O/') ||
          imageUrl.includes('/common/') ||
          imageUrl.includes('/banner/') ||
          imageUrl.includes('_banner') ||
          imageUrl.includes('english') ||
          imageUrl.includes('service') ||
          imageUrl.includes('contact')) {
        console.log(`Filtered promotional banner: ${imageUrl.substring(0, 80)}...`);
        return false;
      }

      // Filter out duplicate /P/ (preview) versions - we only need /J/ (JPEG) versions
      if (imageUrl.includes('/P/')) {
        console.log(`Filtering duplicate preview version: ${imageUrl.substring(0, 80)}...`);
        return false;
      }

      // Extract the image sequence number from W00XXX pattern for vehicle inspection photos
      const sequenceMatch = imageUrl.match(/W00(\d+)\.jpg/);
      if (sequenceMatch) {
        const sequenceNum = parseInt(sequenceMatch[1]);
        
        // Only keep core vehicle inspection sequences - tighter filtering
        // 102-109: Primary vehicle inspection photos only (avoiding promotional sequences)
        // 202-209: Secondary inspection sequence for additional views
        if ((sequenceNum >= 102 && sequenceNum <= 109) || (sequenceNum >= 202 && sequenceNum <= 209)) {
          console.log(`Keeping authentic vehicle inspection photo at sequence ${sequenceNum}: ${imageUrl.substring(0, 80)}...`);
          return true;
        } else {
          console.log(`Skipping sequence ${sequenceNum} - outside core inspection ranges: ${imageUrl.substring(0, 80)}...`);
          return false;
        }
      }
      
      // Filter out any images that don't match vehicle inspection patterns
      if (!imageUrl.includes('/J/') || !imageUrl.match(/\d{7}A\d{8}W00\d{3}\.jpg/)) {
        console.log(`Filtering non-inspection image: ${imageUrl.substring(0, 80)}...`);
        return false;
      }
      
      return true;
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