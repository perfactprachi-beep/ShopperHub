import { getProducts, getProductBySlug, searchProducts } from '../db/queries/products.js';
import { getCategoriesTree, getCategoryBySlug } from '../db/queries/categories.js';
import { getBrands, getBrandBySlug } from '../db/queries/brands.js';

export async function listProducts(req, res, next) {
  try {
    const { category, brand, gender, minPrice, maxPrice, minDiscount, sort, page, limit } = req.query;
    const rows = await getProducts({ category, brand, gender, minPrice, maxPrice, minDiscount, sort, page, limit });
    const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
    res.json({ success: true, data: rows, total, page: Number(page || 1) });
  } catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function searchProductsHandler(req, res, next) {
  try {
    const { q, limit } = req.query;
    if (!q?.trim()) return res.json({ success: true, data: [] });
    const results = await searchProducts(q.trim(), Number(limit) || 20);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}

export async function listCategories(_req, res, next) {
  try {
    const tree = await getCategoriesTree();
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
}

export async function listProductsByCategory(req, res, next) {
  try {
    const cat = await getCategoryBySlug(req.params.slug);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    const { sort, page, limit, gender, minPrice, maxPrice, brand } = req.query;
    const rows = await getProducts({ category: req.params.slug, brand, gender, minPrice, maxPrice, sort, page, limit });
    const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
    res.json({ success: true, category: cat, data: rows, total, page: Number(page || 1) });
  } catch (err) { next(err); }
}

export async function listBrands(_req, res, next) {
  try {
    const brands = await getBrands();
    res.json({ success: true, data: brands });
  } catch (err) { next(err); }
}

export async function listProductsByBrand(req, res, next) {
  try {
    const brand = await getBrandBySlug(req.params.slug);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    const { sort, page, limit, gender, minPrice, maxPrice, category } = req.query;
    const rows = await getProducts({ brand: req.params.slug, category, gender, minPrice, maxPrice, sort, page, limit });
    const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
    res.json({ success: true, brand, data: rows, total, page: Number(page || 1) });
  } catch (err) { next(err); }
}
