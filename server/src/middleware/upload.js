import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = sanitizeFilename(path.parse(file.originalname).name);
    cb(null, `${Date.now()}-${safe}.tmp`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

async function optimizeToWebp(file) {
  const inputPath  = file.path;
  const outputPath = inputPath.replace(/\.tmp$/, '.webp');
  // Read into buffer first so sharp doesn't hold a lock on the source file (Windows EBUSY fix)
  const inputBuffer = fs.readFileSync(inputPath);
  await sharp(inputBuffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  fs.unlinkSync(inputPath);
  file.path     = outputPath;
  file.filename = path.basename(outputPath);
}

function withOptimization(handler) {
  return async (req, res, next) => {
    handler(req, res, async (err) => {
      if (err) return next(err);
      try {
        if (req.file)  await optimizeToWebp(req.file);
        if (req.files) await Promise.all(req.files.map(optimizeToWebp));
        next();
      } catch (e) { next(e); }
    });
  };
}

const multerSingle = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');
const multerImages = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 6 } }).array('images', 6);

export const uploadSingle = withOptimization(multerSingle);
export const uploadImages = withOptimization(multerImages);
