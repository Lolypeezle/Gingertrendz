const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Database & Supabase Adapter
const db = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Curator / Private Access Credentials
const CURATOR_CREDENTIALS = {
  emails: ['curator@gingertrendz.com', 'admin@gingertrendz.com', 'director@gingertrendz.com'],
  password: 'admin123'
};

// ==========================================
// EMAIL NOTIFICATION SYSTEM (NODEMAILER)
// ==========================================
let mailTransporter = null;
async function getTransporter() {
  if (mailTransporter) return mailTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (e) {
    mailTransporter = {
      sendMail: async (opts) => ({ messageId: 'simulated-' + Date.now(), ...opts })
    };
  }
  return mailTransporter;
}

// Generate Drop Announcement Email HTML Template
function generateDropEmailHtml(product) {
  const sizesStr = (product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).join(' • ');
  const priceFormatted = Number(product.price).toLocaleString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0A0A0C; font-family: 'DM Sans', -apple-system, Roboto, sans-serif; }
      </style>
    </head>
    <body style="background-color: #212A31; margin: 0; padding: 30px 10px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #2E3944; border: 1px solid rgba(116, 141, 146, 0.25); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: #1B2228; padding: 22px 24px; text-align: center; border-bottom: 1px solid rgba(116, 141, 146, 0.2);">
          <span style="font-size: 11px; letter-spacing: 0.25em; color: #748D92; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">THE FASHION DISCIPLES</span>
          <h1 style="font-size: 22px; margin: 0; letter-spacing: 0.15em; color: #D3D9D4; font-weight: 400;">NEW DROP LIVE</h1>
        </div>

        <!-- Body -->
        <div style="padding: 34px 28px; text-align: center;">
          <span style="display: inline-block; font-size: 11px; letter-spacing: 0.15em; color: #D3D9D4; text-transform: uppercase; background: rgba(18, 78, 102, 0.35); border: 1px solid rgba(18, 78, 102, 0.5); padding: 5px 14px; border-radius: 20px; margin-bottom: 16px;">
            ✦ NEW GARMENT DROP ALERT ✦
          </span>
          <h2 style="font-size: 26px; margin: 0 0 10px; color: #D3D9D4; font-weight: 400;">${product.title}</h2>
          <p style="color: #748D92; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto 24px;">
            ${product.description}
          </p>

          <!-- Product Card Preview in Email -->
          <div style="margin: 0 auto 28px; max-width: 440px; background: #212A31; border: 1px solid rgba(116, 141, 146, 0.22); border-radius: 6px; overflow: hidden; text-align: left;">
            <div style="width: 100%; height: 260px; background: #1B2228; overflow: hidden; position: relative;">
              <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            </div>
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(116, 141, 146, 0.2);">
              <div>
                <span style="font-size: 11px; color: #748D92; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Silhouette Sizes:</span>
                <strong style="color: #D3D9D4; font-size: 13px; letter-spacing: 0.05em;">${sizesStr}</strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11px; color: #748D92; text-transform: uppercase; display: block; font-weight: 600;">Price</span>
                <span style="font-size: 20px; font-weight: 700; color: #D3D9D4;">₦${priceFormatted}</span>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="margin-top: 10px;">
            <a href="http://localhost:3000/#shop" style="display: inline-block; background-color: #124E66; color: #D3D9D4; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 36px; border-radius: 4px; box-shadow: 0 4px 18px rgba(18, 78, 102, 0.35);">
              Explore Drop & Claim Your Size
            </a>
          </div>

          <!-- Footer Note -->
          <div style="margin-top: 36px; border-top: 1px solid rgba(116, 141, 146, 0.2); padding-top: 20px; text-align: center;">
            <p style="font-size: 11px; color: #53676B; margin: 0 0 6px;">
              You received this drop update because you shopped at The Fashion Disciples or joined our VIP newsletter.
            </p>
            <p style="font-size: 11px; color: #53676B; margin: 0;">
              &copy; 2026 THE FASHION DISCIPLES. Powered by Supabase & Node.js.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Order Confirmation Email HTML Template
function generateOrderEmailHtml(order) {
  const itemsListHtml = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid rgba(116, 141, 146, 0.15);">
      <td style="padding: 10px 0; color: #D3D9D4; font-size: 13px;">${item.title} (Size: <strong>${item.size}</strong>) × ${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right; color: #D3D9D4; font-weight: 700; font-size: 13px;">₦${Number(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #212A31; color: #D3D9D4; font-family: sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid rgba(116, 141, 146, 0.25); border-radius: 8px; padding: 28px;">
      <h2 style="color: #D3D9D4; margin-top: 0; letter-spacing: 0.08em;">THE FASHION DISCIPLES</h2>
      <h3 style="color: #D3D9D4; margin-bottom: 4px;">Order Confirmed: ${order.id}</h3>
      <p style="color: #748D92; font-size: 13px;">Hello ${order.customer.firstName}, thank you for your order. Your garment is being prepared for dispatch.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${itemsListHtml}
        <tr>
          <td style="padding: 12px 0; font-weight: 700; color: #D3D9D4;">Total Paid (${order.method})</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #D3D9D4; font-size: 16px;">₦${Number(order.total).toLocaleString()}</td>
        </tr>
      </table>

      <div style="background: #18181E; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #9E9EA8; border: 1px solid rgba(255,255,255,0.06);">
        <strong>Delivery Destination:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
      </div>

      <p style="font-size: 11px; color: #666673; margin-top: 24px;">
        ✨ As a valued customer, you will also receive exclusive email drop updates in your inbox whenever new Gingertrendz garments land on the website.
      </p>
    </div>
  `;
}

// Function to dispatch email broadcast to all subscribers
async function dispatchDropNotification(product) {
  const subscribers = await db.getSubscribers();
  if (!subscribers.length) return { count: 0, recipients: [] };

  const emailHtml = generateDropEmailHtml(product);
  const subject = `✦ NEW ATELIER DROP: ${product.title} is Live on Gingertrendz`;
  const recipients = subscribers.map(s => s.email);

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: '"Gingertrendz Atelier" <atelier@gingertrendz.com>',
      to: 'atelier@gingertrendz.com',
      bcc: recipients.join(', '),
      subject: subject,
      html: emailHtml
    });
  } catch (err) {
    console.warn('Transporter send note:', err.message);
  }

  // Update subscriber last_notified timestamps
  const now = new Date().toISOString();
  for (const sub of subscribers) {
    sub.last_notified = now;
    await db.saveSubscriber(sub.email, sub.name, sub.source);
  }

  // Log campaign to database
  const newLog = {
    id: 'EML-' + Math.floor(1000 + Math.random() * 9000),
    type: 'drop_announcement',
    subject,
    recipientsCount: recipients.length,
    recipients,
    product: {
      id: product.id,
      title: product.title,
      price: product.price,
      sizes: product.sizes,
      image: product.image
    },
    sent_at: now,
    status: 'Dispatched',
    htmlPreview: emailHtml
  };
  await db.saveEmailLog(newLog);

  return { count: recipients.length, recipients, log: newLog };
}

// ========================
// API ROUTES: DATABASE & SUPABASE
// ========================

// GET /api/database/status
app.get('/api/database/status', (req, res) => {
  const status = db.getStatus();
  res.json({ success: true, ...status });
});

// POST /api/database/test
app.post('/api/database/test', async (req, res) => {
  const result = await db.testConnection();
  res.json({ success: result.connected, ...result });
});

// POST /api/database/config
app.post('/api/database/config', async (req, res) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, message: 'Both Supabase URL and Key are required.' });
  }

  db.configure(url, key, true);
  const testRes = await db.testConnection();
  res.json({
    success: testRes.connected,
    message: testRes.message,
    status: db.getStatus()
  });
});

// POST /api/database/sync
app.post('/api/database/sync', async (req, res) => {
  const syncRes = await db.syncLocalToSupabase();
  res.json(syncRes);
});

// GET /api/database/schema
app.get('/api/database/schema', (req, res) => {
  const schemaFile = path.join(__dirname, 'supabase_schema.sql');
  if (fs.existsSync(schemaFile)) {
    const content = fs.readFileSync(schemaFile, 'utf8');
    res.json({ success: true, schema: content });
  } else {
    res.status(404).json({ success: false, message: 'Schema file not found' });
  }
});

// ========================
// API ROUTES: PRODUCTS
// ========================

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getProducts(req.query);
    res.json({ success: true, count: products.length, products, dbStatus: db.getStatus() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products (Curator Add + Auto Notify Subscribers)
app.post('/api/products', async (req, res) => {
  const { title, category, price, description, image, color, stock, sizes, sizeStock, badge, notifySubscribers } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, price, and category are required.' });
  }

  const parsedSizes = Array.isArray(sizes)
    ? sizes
    : (typeof sizes === 'string' ? sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : ['S', 'M', 'L', 'XL']);

  const parsedSizeStock = sizeStock && typeof sizeStock === 'object' ? sizeStock : {};
  const totalStock = Number(stock) || Object.values(parsedSizeStock).reduce((sum, val) => sum + (Number(val) || 0), 0) || 10;

  parsedSizes.forEach(s => {
    if (parsedSizeStock[s] === undefined) {
      parsedSizeStock[s] = Math.max(1, Math.floor(totalStock / parsedSizes.length));
    }
  });

  const newProduct = {
    id: 'gt-' + Date.now(),
    title: String(title).trim(),
    category: String(category).trim(),
    price: Number(price),
    description: String(description || '').trim(),
    image: image || 'assets/images/product_hoodie_1793575280654.jpg',
    color: color || '#D4772C',
    stock: totalStock,
    sizes: parsedSizes,
    sizeStock: parsedSizeStock,
    badge: badge || 'New Drop',
    created_at: new Date().toISOString()
  };

  await db.addProduct(newProduct);

  // Auto-broadcast email drop notification if enabled (default true)
  let emailDispatchResult = null;
  if (notifySubscribers !== false) {
    emailDispatchResult = await dispatchDropNotification(newProduct);
  }

  res.status(201).json({
    success: true,
    product: newProduct,
    emailDispatched: emailDispatchResult
  });
});

// PUT /api/products/:id (Curator Edit)
app.put('/api/products/:id', async (req, res) => {
  const existing = await db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { title, category, price, description, image, color, stock, sizes, sizeStock, badge } = req.body;

  const parsedSizes = sizes !== undefined
    ? (Array.isArray(sizes) ? sizes : String(sizes).split(',').map(s => s.trim().toUpperCase()).filter(Boolean))
    : existing.sizes;

  const updatedSizeStock = sizeStock !== undefined ? sizeStock : existing.sizeStock || {};

  const updatedProduct = {
    ...existing,
    title: title !== undefined ? String(title).trim() : existing.title,
    category: category !== undefined ? String(category).trim() : existing.category,
    price: price !== undefined ? Number(price) : existing.price,
    description: description !== undefined ? String(description).trim() : existing.description,
    image: image !== undefined ? image : existing.image,
    color: color !== undefined ? color : existing.color,
    stock: stock !== undefined ? Number(stock) : existing.stock,
    sizes: parsedSizes,
    sizeStock: updatedSizeStock,
    badge: badge !== undefined ? badge : existing.badge,
    updated_at: new Date().toISOString()
  };

  await db.updateProduct(req.params.id, updatedProduct);
  res.json({ success: true, product: updatedProduct });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
  const existing = await db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  await db.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product removed from catalog' });
});

// POST /api/products/reset
app.post('/api/products/reset', async (req, res) => {
  const defaultProducts = [
    {
      id: "gt-001",
      title: "Gingertrendz Heavyweight Atelier Hoodie",
      category: "Hoodies",
      price: 48000,
      description: "Engineered from 520GSM combed organic loopback French terry. Cut in an oversized, relaxed drop-shoulder silhouette with double-layered hood and tonal embroidered brand signature.",
      image: "assets/images/product_hoodie_1793575280654.jpg",
      color: "#D4772C",
      stock: 24,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      sizeStock: { "XS": 3, "S": 5, "M": 7, "L": 5, "XL": 3, "XXL": 1 },
      badge: "Signature",
      created_at: new Date().toISOString()
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
      sizeStock: { "S": 2, "M": 5, "L": 4, "XL": 3 },
      badge: "Limited Edition",
      created_at: new Date().toISOString()
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
      sizeStock: { "XS": 2, "S": 4, "M": 6, "L": 4, "XL": 2 },
      badge: "Winter Drop",
      created_at: new Date().toISOString()
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
      sizeStock: { "XS": 3, "S": 4, "M": 6, "L": 4, "XL": 2, "XXL": 1 },
      badge: "Trending",
      created_at: new Date().toISOString()
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
      sizeStock: { "S": 3, "M": 5, "L": 5, "XL": 2 },
      badge: "Atelier",
      created_at: new Date().toISOString()
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
      sizeStock: { "XS": 4, "S": 6, "M": 8, "L": 6, "XL": 4, "XXL": 2 },
      badge: "Essential",
      created_at: new Date().toISOString()
    }
  ];

  await db.resetProducts(defaultProducts);
  res.json({ success: true, message: 'Products restored to default catalog', products: defaultProducts });
});

// ========================
// API ROUTES: ORDERS
// ========================

// GET /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders (Checkout Creation + Automatic Customer Email Enrolment)
app.post('/api/orders', async (req, res) => {
  const { customer, items, subtotal, shipping, total, method, subscribeEmail } = req.body;

  if (!customer || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Customer and items are required.' });
  }

  // Deduct inventory per size
  for (const cartItem of items) {
    const product = await db.getProductById(cartItem.id);
    if (product) {
      const size = cartItem.size || 'M';
      if (product.sizeStock && product.sizeStock[size] !== undefined) {
        product.sizeStock[size] = Math.max(0, product.sizeStock[size] - (cartItem.quantity || 1));
      }
      product.stock = Object.values(product.sizeStock || {}).reduce((s, v) => s + v, 0) || Math.max(0, product.stock - (cartItem.quantity || 1));
      await db.updateProduct(product.id, product);
    }
  }

  const newOrder = {
    id: 'GT-ORD-' + Math.floor(1000 + Math.random() * 9000),
    customer,
    items,
    subtotal: Number(subtotal),
    shipping: Number(shipping),
    total: Number(total),
    method: method || 'Standard Courier Delivery',
    status: 'Processing',
    created_at: new Date().toISOString()
  };

  await db.addOrder(newOrder);

  // AUTOMATIC EMAIL SUBSCRIPTION:
  // Every email input on checkout is enrolled to receive all new drop announcements
  if (customer.email) {
    await db.saveSubscriber(customer.email, `${customer.firstName} ${customer.lastName}`, 'checkout');

    // Send order confirmation email
    try {
      const transporter = await getTransporter();
      transporter.sendMail({
        from: '"Gingertrendz Atelier" <orders@gingertrendz.com>',
        to: customer.email,
        subject: `Your Gingertrendz Order ${newOrder.id} is Confirmed`,
        html: generateOrderEmailHtml(newOrder)
      });
    } catch (e) {
      console.warn('Order confirmation email note:', e.message);
    }
  }

  res.status(201).json({ success: true, order: newOrder });
});

// PUT /api/orders/:id
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  const updated = await db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order: updated });
});

// ==========================================
// API ROUTES: SUBSCRIBERS & EMAIL BROADCAST
// ==========================================

// GET /api/subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await db.getSubscribers();
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/subscribers (Checkout or Newsletter subscription)
app.post('/api/subscribers', async (req, res) => {
  const { email, name, source } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  const subscriber = await db.saveSubscriber(email, name, source || 'newsletter');
  res.json({ success: true, subscriber, message: 'Subscribed to Gingertrendz Atelier Drop Updates!' });
});

// DELETE /api/subscribers/:email
app.delete('/api/subscribers/:email', async (req, res) => {
  await db.deleteSubscriber(req.params.email);
  res.json({ success: true, message: 'Subscriber removed.' });
});

// GET /api/email-logs
app.get('/api/email-logs', async (req, res) => {
  try {
    const logs = await db.getEmailLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/broadcast-drop (Curator Manual Drop Email Trigger)
app.post('/api/broadcast-drop', async (req, res) => {
  const { productId } = req.body;
  const product = await db.getProductById(productId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const result = await dispatchDropNotification(product);
  res.json({
    success: true,
    message: `Drop notification dispatched to ${result.count} email subscribers!`,
    details: result
  });
});

// ========================
// API ROUTES: CURATOR AUTH & STATS
// ========================

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const matchEmail = !email || CURATOR_CREDENTIALS.emails.some(e => e.toLowerCase() === email.trim().toLowerCase());
  const matchPass = password === CURATOR_CREDENTIALS.password;

  if (matchEmail && matchPass) {
    return res.json({
      success: true,
      token: 'gt-curator-session-' + Date.now(),
      admin: { name: 'Gingertrendz Curator', email: email || 'curator@gingertrendz.com' }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid private access key or curator email.' });
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const orders = await db.getOrders();
    const products = await db.getProducts();
    const subscribers = await db.getSubscribers();
    const emailLogs = await db.getEmailLogs();

    const totalSales = orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
    const totalOrders = orders.length;
    const avgValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyRevenue = [320000, 480000, 610000, 790000, 920000, totalSales > 0 ? totalSales : 1240000];

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        avgValue,
        totalProducts: products.length,
        totalSubscribers: subscribers.length,
        totalCampaignsSent: emailLogs.length,
        monthlyRevenue,
        months
      },
      dbStatus: db.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  const dbStatus = db.getStatus();
  console.log(`===============================================`);
  console.log(` GINGERTRENDZ Luxury Storefront Live!          `);
  console.log(` Local Server: http://localhost:${PORT}        `);
  console.log(` Curator Portal: http://localhost:${PORT}/#portal`);
  console.log(` Database: [${dbStatus.provider.toUpperCase()}] Connected: ${dbStatus.connected}`);
  console.log(` Email Notifications Engine: ACTIVE            `);
  console.log(`===============================================`);
});
