import { getBrowser, newStealthPage } from '../browser.js';
import { randomDelay } from '../utils/delay.js';
import { logError } from '../utils/logger.js';
import { downloadImage } from '../utils/downloadImage.js';
import slugifyLib from 'slugify';

const slugify = (s) => slugifyLib(s || 'product', { lower: true, strict: true });

export async function scrapeProductDetail(url) {
  const browser = await getBrowser();
  const page = await newStealthPage(browser);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await randomDelay(2000, 3000);

    const data = await page.evaluate(() => {
      const getText = (sel) => document.querySelector(sel)?.innerText?.trim() || null;
      const parsePrice = (str) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[₹,\s]/g, '')) || 0;
      };

      const title = getText('[class*="product-name"], [class*="productName"], h1') || document.title?.split('|')?.[0]?.trim();
      const brand = getText('[class*="brand-name"], [class*="brandName"], [class*="brand"]');
      const description = getText('[class*="description"], [class*="product-desc"], [class*="details"]');
      const category = getText('[class*="breadcrumb"] li:nth-last-child(2), [class*="breadcrumb"] a:nth-last-child(2)');
      const priceRaw = getText('[class*="price-final"], [class*="selling-price"], [class*="discounted"], [class*="price"]');
      const mrpRaw = getText('[class*="price-mrp"], [class*="original-price"], [class*="strikethrough"], del');
      const discountRaw = getText('[class*="discount"], [class*="off"]');

      const basePrice = parsePrice(mrpRaw) || parsePrice(priceRaw);
      const finalPrice = parsePrice(priceRaw);
      const discountPct =
        basePrice > 0 && finalPrice > 0 && basePrice > finalPrice
          ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
          : parseInt(discountRaw?.match(/\d+/)?.[0] || '0', 10);

      const images = [];
      document.querySelectorAll('[class*="product-image"] img, [class*="gallery"] img, [class*="carousel"] img, picture img').forEach((img) => {
        const src = img.getAttribute('data-zoom-image') || img.getAttribute('data-large') || img.src || img.dataset.src;
        if (src && !src.includes('placeholder') && !images.includes(src)) images.push(src);
      });

      const sizes = [];
      document.querySelectorAll('[class*="size"] button, [class*="size-option"], [aria-label*="size"]').forEach((el) => {
        const size = el.innerText?.trim();
        if (size && size.length < 10) sizes.push(size);
      });

      const colors = [];
      document.querySelectorAll('[class*="color"] button, [class*="colour"] button, [aria-label*="color"]').forEach((el) => {
        const color = el.getAttribute('aria-label') || el.innerText?.trim();
        if (color && color.length < 20) colors.push(color);
      });

      const breadText = document.querySelector('[class*="breadcrumb"]')?.innerText?.toLowerCase() || '';
      const gender = breadText.includes('women') ? 'women' : breadText.includes('men') ? 'men' : breadText.includes('kids') ? 'kids' : 'unisex';
      const sku = document.querySelector('[data-product-id]')?.getAttribute('data-product-id') || url.match(/\/p\/([^/?]+)/)?.[1] || null;

      return { title, brand, description, category, basePrice, discountPct, gender, sku, images: images.slice(0, 6), sizes: [...new Set(sizes)], colors: [...new Set(colors)] };
    });

    const productSlug = `${slugify(data.title || data.sku)}${data.sku ? `-${slugify(data.sku).slice(0, 24)}` : ''}`;
    const savedImages = [];
    for (let i = 0; i < data.images.length; i += 1) {
      const savedPath = await downloadImage(data.images[i], `product-${productSlug}-${i}`);
      if (savedPath) savedImages.push({ url: savedPath, is_primary: i === 0, sort_order: i });
    }

    const sizes = data.sizes.length ? data.sizes : ['Free Size'];
    const colors = data.colors.length ? data.colors : ['Default'];

    return {
      ...data,
      slug: productSlug,
      url,
      images: savedImages,
      variants: sizes
        .flatMap((size, si) =>
          colors.map((color, ci) => ({
            size,
            color,
            sku: `${data.sku || productSlug}-${si}-${ci}`,
            stock: Math.floor(Math.random() * 50) + 5,
            extra_price: 0,
          }))
        )
        .slice(0, 20),
    };
  } catch (err) {
    logError(`Product detail scrape failed: ${url}`, err);
    return null;
  } finally {
    await page.close();
  }
}
