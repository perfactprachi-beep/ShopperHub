import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config.js';

export async function downloadImage(url, filename) {
  try {
    if (!url || url.startsWith('data:')) return null;
    fs.mkdirSync(CONFIG.IMAGE_DIR, { recursive: true });

    const outputPath = path.join(CONFIG.IMAGE_DIR, `${filename}.webp`);
    if (fs.existsSync(outputPath)) return `/uploads/scraped/images/${filename}.webp`;

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    await sharp(Buffer.from(response.data))
      .resize(CONFIG.IMAGE_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: CONFIG.IMAGE_QUALITY })
      .toFile(outputPath);

    return `/uploads/scraped/images/${filename}.webp`;
  } catch {
    return null;
  }
}
