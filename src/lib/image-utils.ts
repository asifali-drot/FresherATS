/**
 * Download an image from a URL and convert it to a base64 data URI
 * This is necessary for @react-pdf/renderer which doesn't handle remote URLs well
 * Converts unsupported formats (like WebP) to JPEG
 */
export async function downloadImageAsBase64(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;

  try {
    // Check if it's already a data URI
    if (url.startsWith('data:')) {
      return url;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image from ${url}: ${response.status}`);
      return undefined;
    }

    let contentType = response.headers.get('content-type') || 'image/jpeg';
    let buffer = await response.arrayBuffer();

    // @react-pdf/renderer doesn't support WebP, convert to JPEG
    if (contentType.includes('webp')) {
      console.log('[Image Utils] Converting WebP to JPEG for PDF compatibility');
      const sharp = require('sharp');
      buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
      contentType = 'image/jpeg';
    }

    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.warn(`Error downloading image from ${url}:`, error);
    return undefined;
  }
}
