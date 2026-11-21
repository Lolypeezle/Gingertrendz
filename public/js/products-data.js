/**
 * GINGERTRENDZ - Client-Side Products & Inventory Store
 * Provides instant zero-latency product loading and seamless local persistence
 * for admin additions, edits, and deletions across local and Netlify static deployments.
 */

const GT_DEFAULT_PRODUCTS = [
  {
    id: "gt-001",
    title: "Gingertrendz Heavyweight Signature Hoodie",
    category: "Hoodies",
    price: 48000,
    description: "Engineered from 520GSM combed organic loopback French terry. Cut in an oversized, relaxed drop-shoulder silhouette with double-layered hood and tonal embroidered brand signature.",
    image: "assets/images/product_hoodie_1793575280654.jpg",
    color: "#D4772C",
    stock: 24,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 5, "M": 7, "S": 5, "XL": 3, "XS": 3, "XXL": 1 },
    sizeStock: { "L": 5, "M": 7, "S": 5, "XL": 3, "XS": 3, "XXL": 1 },
    badge: "Signature Drop",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-002",
    title: "Terracotta Belted Overcoat Trench",
    category: "Outerwear",
    price: 75000,
    description: "Double-breasted trench crafted from heavyweight Italian wool-blend gabardine in rich terracotta rust. Features a structured storm flap, horn buckles, and deep side welt pockets.",
    image: "assets/images/product_jacket_1793575295368.jpg",
    color: "#943D1A",
    stock: 14,
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "L": 4, "M": 5, "S": 2, "XL": 3 },
    sizeStock: { "L": 4, "M": 5, "S": 2, "XL": 3 },
    badge: "Limited Edition",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-003",
    title: "Gloss Ginger Quilted Puffer Jacket",
    category: "Outerwear",
    price: 68000,
    description: "Water-repellent ripstop shell stuffed with sustainably sourced 700-fill down alternative. Features a high insulated funnel neck, storm cuffs, and matte gunmetal zipper hardware.",
    image: "assets/images/product_puffer_1793575627533.jpg",
    color: "#B85523",
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL"],
    size_stock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 2 },
    sizeStock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 2 },
    badge: "Winter Drop",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-004",
    title: "Chunky Ribbed Ginger Knit Sweater",
    category: "Hoodies",
    price: 42000,
    description: "Chunky fisherman knit spun from 100% Australian merino wool blend. Features dropped shoulders, thick ribbed collar, and raw-textured sleeve hems for an effortless architectural drape.",
    image: "assets/images/product_knit_1793575650504.jpg",
    color: "#C45B25",
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 3, "XXL": 1 },
    sizeStock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 3, "XXL": 1 },
    badge: "Trending",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-005",
    title: "Pleated Wide-Leg Studio Trouser",
    category: "Pants",
    price: 38000,
    description: "Tailored double-pleated relaxed trousers in deep volcanic charcoal with amber stitching accents. High-waisted drape with discreet elastic back waistband and tailored cuff break.",
    image: "assets/images/hero_banner_1793575264897.jpg",
    color: "#2D2622",
    stock: 15,
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "L": 5, "M": 5, "S": 3, "XL": 2 },
    sizeStock: { "L": 5, "M": 5, "S": 3, "XL": 2 },
    badge: "Signature",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-006",
    title: "Vintage Washed Box Tee - Ginger Monogram",
    category: "Tees",
    price: 24000,
    description: "Heavy 280GSM ring-spun cotton tee with custom mineral wash. Finished with subtle distressed collar edge, wide boxy sleeves, and blind-stitched hem.",
    image: "assets/images/product_hoodie_1793575280654.jpg",
    color: "#1C1714",
    stock: 30,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 6, "M": 8, "S": 6, "XL": 4, "XS": 4, "XXL": 2 },
    sizeStock: { "L": 6, "M": 8, "S": 6, "XL": 4, "XS": 4, "XXL": 2 },
    badge: "Essential",
    created_at: "2026-11-07T20:40:05.391872+00:00"
  }
];

window.GT_PRODUCTS_STORE = {
  STORAGE_KEY_CUSTOM: 'gt_custom_products_v2',
  STORAGE_KEY_DELETED: 'gt_deleted_product_ids_v2',

  getCustomProducts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CUSTOM);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Storage read error:', e);
      return [];
    }
  },

  getDeletedIds() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_DELETED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getAllProducts() {
    const custom = this.getCustomProducts();
    const deleted = this.getDeletedIds();

    // Map custom products by ID for instant override
    const customMap = new Map();
    custom.forEach(p => customMap.set(p.id, p));

    // Combine custom and default items (excluding deleted)
    const result = [];

    // Add custom/new items first
    custom.forEach(p => {
      if (!deleted.includes(p.id)) {
        result.push(p);
      }
    });

    // Add default items that haven't been deleted or overridden
    GT_DEFAULT_PRODUCTS.forEach(p => {
      if (!deleted.includes(p.id) && !customMap.has(p.id)) {
        result.push(p);
      }
    });

    return result;
  },

  saveProduct(payload, existingId) {
    const custom = this.getCustomProducts();
    const deleted = this.getDeletedIds();

    let productObj;

    if (existingId) {
      // Edit existing product
      const existingIdx = custom.findIndex(p => p.id === existingId);
      productObj = {
        id: existingId,
        ...payload,
        updated_at: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        custom[existingIdx] = productObj;
      } else {
        // Was a default product now modified
        custom.unshift(productObj);
      }

      // If it was somehow in deleted list, remove it
      const delIdx = deleted.indexOf(existingId);
      if (delIdx !== -1) {
        deleted.splice(delIdx, 1);
        localStorage.setItem(this.STORAGE_KEY_DELETED, JSON.stringify(deleted));
      }
    } else {
      // Create new product
      const newId = 'gt-prod-' + Date.now();
      productObj = {
        id: newId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      custom.unshift(productObj);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY_CUSTOM, JSON.stringify(custom));
    } catch (e) {
      console.warn('LocalStorage save error (quota exceeded):', e);
    }

    return productObj;
  },

  deleteProduct(id) {
    let custom = this.getCustomProducts();
    custom = custom.filter(p => p.id !== id);
    try {
      localStorage.setItem(this.STORAGE_KEY_CUSTOM, JSON.stringify(custom));
    } catch (e) {}

    const deleted = this.getDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      try {
        localStorage.setItem(this.STORAGE_KEY_DELETED, JSON.stringify(deleted));
      } catch (e) {}
    }
    return true;
  },

  resetCatalog() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_CUSTOM);
      localStorage.removeItem(this.STORAGE_KEY_DELETED);
    } catch (e) {}
    return GT_DEFAULT_PRODUCTS;
  }
};
