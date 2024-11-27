/**
 * Transform image URL to use Cloudinary optimization
 * @param originalUrl Original image URL
 * @param options Transformation options
 * @returns Cloudinary optimized URL
 */
export const getOptimizedImageUrl = (originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'png' | 'jpg';
} = {}) => {
    if (!originalUrl) return '';

    try {
        // Only process HTTP(S) URLs
        if (!originalUrl.startsWith('http')) {
            return originalUrl;
        }

        const {
            width = 64,  // Default size for token images
            height = 64,
            quality = 'auto',
            format = 'auto'
        } = options;

        // Construct Cloudinary URL
        const baseUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/fetch`;
        const transformations = [
            'f_' + format,           // Format
            'q_' + quality,          // Quality
            `w_${width}`,           // Width
            `h_${height}`,          // Height
            'c_fill',               // Crop mode
            'g_center'              // Gravity
        ].join(',');

        return `${baseUrl}/${transformations}/${encodeURIComponent(originalUrl)}`;
    } catch (error) {
        console.error('Error creating Cloudinary URL:', error);
        return originalUrl;
    }
};

/**
 * Preload image with Cloudinary optimization
 * @param originalUrl Original image URL
 * @returns Promise that resolves when image is loaded
 */
export const preloadOptimizedImage = async (originalUrl: string): Promise<string> => {
    const optimizedUrl = getOptimizedImageUrl(originalUrl, {
        width: 64,
        height: 64,
        quality: 90,
        format: 'auto'
    });

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(optimizedUrl);
        img.onerror = () => reject(new Error('Failed to load optimized image'));
        img.src = optimizedUrl;
    });
};
