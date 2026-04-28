export const MAX_SOURCE_IMAGE_SIZE = 20 * 1024 * 1024;
export const MAX_STORED_IMAGE_SIZE = 5 * 1024 * 1024;
export const STORED_IMAGE_MAX_SIDE = 2400;
export const STORED_IMAGE_QUALITY = 0.92;

export const VALID_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const QUALITY_STEPS = [0.92, 0.88, 0.84, 0.8, 0.74];

function buildStoredFileName(fileName: string) {
  const normalizedName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${normalizedName || 'imagen'}.webp`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo leer la imagen "${file.name}"`));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo optimizar la imagen'));
          return;
        }

        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
}

export async function prepareImageForStorage(file: File) {
  const image = await loadImage(file);
  const scale = Math.min(
    1,
    STORED_IMAGE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight),
  );

  if (file.size <= MAX_STORED_IMAGE_SIZE && scale === 1) {
    return file;
  }

  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo preparar la imagen');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  let bestBlob: Blob | null = null;

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, quality);
    bestBlob = blob;

    if (blob.size <= MAX_STORED_IMAGE_SIZE) {
      break;
    }
  }

  if (!bestBlob) {
    throw new Error('No se pudo optimizar la imagen');
  }

  if (bestBlob.size > MAX_STORED_IMAGE_SIZE) {
    throw new Error(
      `La imagen "${file.name}" sigue superando los 5MB despues de optimizarla`,
    );
  }

  return new File([bestBlob], buildStoredFileName(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export async function prepareImagesForStorage(files: File[]) {
  return Promise.all(files.map((file) => prepareImageForStorage(file)));
}
