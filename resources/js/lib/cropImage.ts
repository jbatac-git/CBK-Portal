interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

/** Draws the selected crop area onto a canvas and returns it as a Blob. */
export async function getCroppedImageBlob(imageSrc: string, crop: PixelCrop): Promise<Blob> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))), 'image/png', 0.95);
    });
}