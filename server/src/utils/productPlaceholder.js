// Server-side mirror of client/src/utils/getProductPlaceholder.js
// Returns a relevant Unsplash placeholder URL based on product keywords.

const PLACEHOLDERS = [
  { keys: ['watch', 'casio', 'titan', 'fossil', 'timex', 'chronograph', 'analog', 'digital watch'], url: 'https://images.unsplash.com/photo-1523170335258-f05f0cc3a58d?w=400&q=80' },
  { keys: ['shoe', 'sneaker', 'heel', 'sandal', 'loafer', 'boot', 'footwear', 'slipper', 'flat', 'pump'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { keys: ['bag', 'handbag', 'purse', 'tote', 'clutch', 'satchel', 'backpack'], url: 'https://images.unsplash.com/photo-1548036161-63cfc6adcd6c?w=400&q=80' },
  { keys: ['perfume', 'fragrance', 'deodorant', 'cologne', 'scent', 'eau de', 'aroma', 'candle'], url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80' },
  { keys: ['skincare', 'moisturizer', 'serum', 'cream', 'lotion', 'sunscreen', 'beauty', 'lipstick', 'makeup', 'foundation'], url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80' },
  { keys: ['kurta', 'kurti', 'ethnic', 'salwar', 'lehenga', 'saree', 'dupatta', 'churidar'], url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80' },
  { keys: ['dress', 'gown', 'maxi', 'mini dress', 'jumpsuit', 'playsuit'], url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&q=80' },
  { keys: ['jeans', 'denim', 'trouser', 'pant', 'chino', 'jogger', 'shorts'], url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { keys: ['shirt', 'tshirt', 't-shirt', 'polo', 'sweatshirt', 'hoodie', 'top', 'blouse'], url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80' },
  { keys: ['jacket', 'coat', 'blazer', 'suit', 'waistcoat', 'vest', 'sweater', 'cardigan'], url: 'https://images.unsplash.com/photo-1620012253295-2a47cd0c7fca?w=400&q=80' },
  { keys: ['kids', 'boy', 'girl', 'infant', 'toddler', 'children', 'baby'], url: 'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=400&q=80' },
  { keys: ['sunglass', 'eyewear', 'spectacle', 'goggle'], url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80' },
  { keys: ['bed sheet', 'bedding', 'quilt', 'comforter', 'pillow', 'cushion', 'blanket', 'duvet', 'diwan'], url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80' },
  { keys: ['curtain', 'floor cover', 'rug', 'mat', 'sofa cover', 'chair cover', 'throws'], url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { keys: ['towel', 'bath rug', 'shower curtain', 'bathroom', 'laundry', 'basket'], url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80' },
  { keys: ['dinnerware', 'dinner set', 'plate', 'bowl', 'serveware', 'serving', 'table top', 'cutlery', 'fork', 'spoon', 'knife'], url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
  { keys: ['drinkware', 'glass', 'mug', 'cup', 'tumbler', 'bottle', 'flask', 'tea', 'coffee'], url: 'https://images.unsplash.com/photo-1534650075489-c2f8c5e85b74?w=400&q=80' },
  { keys: ['cookware', 'pan', 'pot', 'wok', 'bakeware', 'tawa', 'kadai', 'pressure cooker'], url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
  { keys: ['kitchen appliance', 'mixer', 'blender', 'toaster', 'kettle', 'microwave', 'air fryer', 'juicer'], url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { keys: ['storage', 'container', 'jar', 'box', 'organiser', 'rack', 'shelf'], url: 'https://images.unsplash.com/photo-1595351298020-038700609878?w=400&q=80' },
  { keys: ['decor', 'figurine', 'vase', 'frame', 'candle holder', 'lamp', 'lantern', 'wall art', 'showpiece', 'home decor'], url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { keys: ['women', 'woman', 'ladies', 'female'], url: 'https://images.unsplash.com/photo-1479064555552-3ef4d4a0aae2?w=400&q=80' },
  { keys: ['men', 'man', 'male', 'gents'], url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80' },
];

const DEFAULT = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80';

export function getProductPlaceholder({ title, category_name, brand_name, gender, slug } = {}) {
  const haystack = [title, category_name, brand_name, gender, slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const { keys, url } of PLACEHOLDERS) {
    if (keys.some(k => haystack.includes(k))) return url;
  }
  return DEFAULT;
}
