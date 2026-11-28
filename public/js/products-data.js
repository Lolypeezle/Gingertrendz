/**
 * GINGERTRENDZ - Client-Side Products, Inventory & Client Store
 * Provides instant zero-latency product loading, rich product metadata,
 * colorways, customer ratings & verified reviews, wishlist, and client order tracking.
 */

const GT_DEFAULT_PRODUCTS = [
  {
    id: "gt-001",
    title: "Gingertrendz Heavyweight Signature Hoodie",
    category: "Hoodies",
    price: 48000,
    description: "Engineered from 520GSM combed organic loopback French terry. Cut in an oversized, relaxed drop-shoulder silhouette with double-layered hood and tonal embroidered brand signature.",
    image: "assets/images/product_hoodie_1793575280654.jpg",
    gallery: [
      "assets/images/product_hoodie_1793575280654.jpg",
      "assets/images/hero_banner_1793575264897.jpg"
    ],
    video: null,
    color: "#D4772C",
    colorName: "Ginger Ochre",
    colors: [
      { name: "Ginger Ochre", hex: "#D4772C" },
      { name: "Volcanic Obsidian", hex: "#1C1714" },
      { name: "Raw Terracotta", hex: "#943D1A" }
    ],
    stock: 24,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 5, "M": 7, "S": 5, "XL": 3, "XS": 3, "XXL": 1 },
    sizeStock: { "L": 5, "M": 7, "S": 5, "XL": 3, "XS": 3, "XXL": 1 },
    badge: "Signature Drop",
    rating: 4.9,
    reviewsCount: 48,
    reviews: [
      {
        author: "Kelechi O.",
        rating: 5,
        date: "Verified Buyer • Lagos",
        comment: "The 520GSM loopback weight is exceptional. Structured architectural drape and premium double-layered hood."
      },
      {
        author: "Damian W.",
        rating: 5,
        date: "Verified Buyer • London",
        comment: "Flawless drop-shoulder silhouette. True luxury construction that outclasses European luxury brands."
      },
      {
        author: "Amina B.",
        rating: 4.8,
        date: "Verified Buyer • Abuja",
        comment: "Deep rich ginger tone. Soft organic feel with heavyweight durability. Highly recommend sizing true."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-002",
    title: "Terracotta Belted Overcoat Trench",
    category: "Outerwear",
    price: 75000,
    description: "Double-breasted trench crafted from heavyweight Italian wool-blend gabardine in rich terracotta rust. Features a structured storm flap, horn buckles, and deep side welt pockets.",
    image: "assets/images/product_jacket_1793575295368.jpg",
    gallery: [
      "assets/images/product_jacket_1793575295368.jpg",
      "assets/images/product_knit_1793575650504.jpg"
    ],
    video: null,
    color: "#943D1A",
    colorName: "Raw Terracotta",
    colors: [
      { name: "Raw Terracotta", hex: "#943D1A" },
      { name: "Dark Walnut", hex: "#3B1C14" },
      { name: "Desert Sand", hex: "#C08552" }
    ],
    stock: 14,
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "L": 4, "M": 5, "S": 2, "XL": 3 },
    sizeStock: { "L": 4, "M": 5, "S": 2, "XL": 3 },
    badge: "Limited Edition",
    rating: 5.0,
    reviewsCount: 32,
    reviews: [
      {
        author: "Femi A.",
        rating: 5,
        date: "Verified Buyer • Victoria Island",
        comment: "Masterclass tailoring. The Italian wool gabardine has substantial weight and hangs impeccably."
      },
      {
        author: "Tariq H.",
        rating: 5,
        date: "Verified Buyer • Dubai",
        comment: "The horn buckle hardware and storm flap details give this an unmistakable editorial presence."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-003",
    title: "Gloss Ginger Quilted Puffer Jacket",
    category: "Outerwear",
    price: 68000,
    description: "Water-repellent ripstop shell stuffed with sustainably sourced 700-fill down alternative. Features a high insulated funnel neck, storm cuffs, and matte gunmetal zipper hardware.",
    image: "assets/images/product_puffer_1793575627533.jpg",
    gallery: [
      "assets/images/product_puffer_1793575627533.jpg",
      "assets/images/product_jacket_1793575295368.jpg"
    ],
    video: null,
    color: "#B85523",
    colorName: "Burnished Bronze",
    colors: [
      { name: "Burnished Bronze", hex: "#B85523" },
      { name: "Matte Black", hex: "#1C1714" },
      { name: "Amber Ochre", hex: "#D4772C" }
    ],
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL"],
    size_stock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 2 },
    sizeStock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 2 },
    badge: "Winter Drop",
    rating: 4.9,
    reviewsCount: 29,
    reviews: [
      {
        author: "Seyi M.",
        rating: 5,
        date: "Verified Buyer • Toronto",
        comment: "Incredibly warm yet lightweight. The subtle sheen and funnel neck make it a statement piece."
      },
      {
        author: "Marcus T.",
        rating: 4.8,
        date: "Verified Buyer • New York",
        comment: "Weather-resistant shell has survived harsh rain. The matte gunmetal hardware feels built to last."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-004",
    title: "Chunky Ribbed Ginger Knit Sweater",
    category: "Hoodies",
    price: 42000,
    description: "Chunky fisherman knit spun from 100% Australian merino wool blend. Features dropped shoulders, thick ribbed collar, and raw-textured sleeve hems for an effortless architectural drape.",
    image: "assets/images/product_knit_1793575650504.jpg",
    gallery: [
      "assets/images/product_knit_1793575650504.jpg",
      "assets/images/hero_banner_1793575264897.jpg"
    ],
    video: null,
    color: "#C45B25",
    colorName: "Cinnamon Rib",
    colors: [
      { name: "Cinnamon Rib", hex: "#C45B25" },
      { name: "Oatmeal Cream", hex: "#F3E9DC" },
      { name: "Charcoal Heather", hex: "#2D2622" }
    ],
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 3, "XXL": 1 },
    sizeStock: { "L": 4, "M": 6, "S": 4, "XL": 2, "XS": 3, "XXL": 1 },
    badge: "Trending",
    rating: 4.8,
    reviewsCount: 41,
    reviews: [
      {
        author: "Chinedu E.",
        rating: 5,
        date: "Verified Buyer • Lekki",
        comment: "Unbelievably soft Australian merino blend. Zero itchiness and maintains its boxy silhouette perfectly."
      },
      {
        author: "Zainab K.",
        rating: 5,
        date: "Verified Buyer • Abuja",
        comment: "The ribbed texture is so dense and rich. One of my favorite pieces from the collection."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-005",
    title: "Pleated Wide-Leg Studio Trouser",
    category: "Pants",
    price: 38000,
    description: "Tailored double-pleated relaxed trousers in deep volcanic charcoal with amber stitching accents. High-waisted drape with discreet elastic back waistband and tailored cuff break.",
    image: "assets/images/hero_banner_1793575264897.jpg",
    gallery: [
      "assets/images/hero_banner_1793575264897.jpg",
      "assets/images/product_hoodie_1793575280654.jpg"
    ],
    video: null,
    color: "#2D2622",
    colorName: "Volcanic Charcoal",
    colors: [
      { name: "Volcanic Charcoal", hex: "#2D2622" },
      { name: "Deep Earth Brown", hex: "#3B1C14" },
      { name: "Desert Stone", hex: "#C08552" }
    ],
    stock: 15,
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "L": 5, "M": 5, "S": 3, "XL": 2 },
    sizeStock: { "L": 5, "M": 5, "S": 3, "XL": 2 },
    badge: "Signature",
    rating: 5.0,
    reviewsCount: 26,
    reviews: [
      {
        author: "Babatunde L.",
        rating: 5,
        date: "Verified Buyer • Ikoyi",
        comment: "The drape on these trousers is world-class. Subtle elastic back makes them as comfortable as sweatpants."
      },
      {
        author: "Julian R.",
        rating: 5,
        date: "Verified Buyer • Paris",
        comment: "Double pleating adds sharp structure. Pairs seamlessly with both dress shoes and chunky loafers."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  },
  {
    id: "gt-006",
    title: "Vintage Washed Box Tee - Ginger Monogram",
    category: "Tees",
    price: 24000,
    description: "Heavy 280GSM ring-spun cotton tee with custom mineral wash. Finished with subtle distressed collar edge, wide boxy sleeves, and blind-stitched hem.",
    image: "assets/images/product_hoodie_1793575280654.jpg",
    gallery: [
      "assets/images/product_hoodie_1793575280654.jpg",
      "assets/images/product_knit_1793575650504.jpg"
    ],
    video: null,
    color: "#1C1714",
    colorName: "Washed Mineral Black",
    colors: [
      { name: "Washed Mineral Black", hex: "#1C1714" },
      { name: "Clay Rust", hex: "#D4772C" },
      { name: "Ecru Champagne", hex: "#F3E9DC" }
    ],
    stock: 30,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    size_stock: { "L": 6, "M": 8, "S": 6, "XL": 4, "XS": 4, "XXL": 2 },
    sizeStock: { "L": 6, "M": 8, "S": 6, "XL": 4, "XS": 4, "XXL": 2 },
    badge: "Essential",
    rating: 4.9,
    reviewsCount: 54,
    reviews: [
      {
        author: "Olamide P.",
        rating: 5,
        date: "Verified Buyer • Ikeja",
        comment: "280GSM heavyweight cotton holds its shape without clinging. Best streetwear tee on the continent."
      },
      {
        author: "Jordan K.",
        rating: 4.8,
        date: "Verified Buyer • Atlanta",
        comment: "Mineral wash has that authentic vintage lived-in look. Ribbed collar stays snug after multiple washes."
      }
    ],
    created_at: "2026-11-07T20:40:05.391872+00:00"
  }
];

window.GT_PRODUCTS_STORE = {
  STORAGE_KEY_CUSTOM: 'gt_custom_products_v2',
  STORAGE_KEY_DELETED: 'gt_deleted_product_ids_v2',
  STORAGE_KEY_WISHLIST: 'gt_wishlist_v2',
  STORAGE_KEY_CUSTOMER_ORDERS: 'gt_customer_orders_v2',

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
        result.push(this.ensureMetadata(p));
      }
    });

    // Add default items that haven't been deleted or overridden
    GT_DEFAULT_PRODUCTS.forEach(p => {
      if (!deleted.includes(p.id) && !customMap.has(p.id)) {
        result.push(this.ensureMetadata(p));
      }
    });

    return result;
  },

  ensureMetadata(p) {
    if (!p.rating) p.rating = 4.9;
    if (!p.reviewsCount) p.reviewsCount = 24;
    if (!p.colors || !p.colors.length) {
      p.colors = [
        { name: p.colorName || 'Brand Tone', hex: p.color || '#C08552' },
        { name: 'Volcanic Obsidian', hex: '#1C1714' },
        { name: 'Raw Terracotta', hex: '#943D1A' }
      ];
    }
    if (!p.gallery || !p.gallery.length) {
      p.gallery = [p.image || 'assets/images/product_hoodie_1793575280654.jpg'];
    }
    if (!p.reviews || !p.reviews.length) {
      p.reviews = [
        {
          author: "Verified Disciple",
          rating: 5,
          date: "Recent Drop Review",
          comment: "Superb textile quality, precise stitch lines and impeccable heavyweight silhouette."
        }
      ];
    }
    return p;
  },

  saveProduct(payload, existingId) {
    const custom = this.getCustomProducts();
    const deleted = this.getDeletedIds();

    let productObj;

    if (existingId) {
      const existingIdx = custom.findIndex(p => p.id === existingId);
      productObj = {
        id: existingId,
        ...payload,
        updated_at: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        custom[existingIdx] = productObj;
      } else {
        custom.unshift(productObj);
      }

      const delIdx = deleted.indexOf(existingId);
      if (delIdx !== -1) {
        deleted.splice(delIdx, 1);
        try {
          localStorage.setItem(this.STORAGE_KEY_DELETED, JSON.stringify(deleted));
        } catch (e) {}
      }
    } else {
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

  /* --- Wishlist System --- */
  getWishlist() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isWishlisted(productId) {
    const list = this.getWishlist();
    return list.includes(productId);
  },

  toggleWishlist(productId) {
    let list = this.getWishlist();
    const idx = list.indexOf(productId);
    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
      added = false;
    } else {
      list.push(productId);
      added = true;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY_WISHLIST, JSON.stringify(list));
    } catch (e) {}
    return { added, count: list.length };
  },

  /* --- Customer Orders Archive --- */
  getCustomerOrders() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CUSTOMER_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCustomerOrder(order) {
    const orders = this.getCustomerOrders();
    orders.unshift(order);
    try {
      localStorage.setItem(this.STORAGE_KEY_CUSTOMER_ORDERS, JSON.stringify(orders));
    } catch (e) {}
  },

  resetCatalog() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_CUSTOM);
      localStorage.removeItem(this.STORAGE_KEY_DELETED);
    } catch (e) {}
    return GT_DEFAULT_PRODUCTS;
  }
};
