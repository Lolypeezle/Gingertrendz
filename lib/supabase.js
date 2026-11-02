/**
 * GINGERTRENDZ - Supabase & Persistent Database Adapter
 * Seamlessly interfaces with Supabase Cloud PostgreSQL with local cache fallback
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'supabase_config.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(filePath, defVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJson(filePath, defVal);
      return defVal;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Read error ${filePath}:`, err.message);
    return defVal;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Write error ${filePath}:`, err.message);
    return false;
  }
}

class DatabaseManager {
  constructor() {
    this.supabase = null;
    this.isConnected = false;
    this.url = '';
    this.key = '';
    this.init();
  }

  init() {
    // Check .env first, then supabase_config.json
    const savedConfig = readJson(CONFIG_FILE, {});
    const url = process.env.SUPABASE_URL || savedConfig.url || '';
    const key = process.env.SUPABASE_KEY || savedConfig.key || '';

    this.configure(url, key, false);
  }

  configure(url, key, saveToDisk = true) {
    this.url = (url || '').trim();
    this.key = (key || '').trim();

    if (this.url && this.key && this.url.startsWith('http')) {
      try {
        this.supabase = createClient(this.url, this.key);
        this.isConnected = true;
        console.log(`[Database] Supabase client configured for: ${this.url}`);
      } catch (err) {
        console.warn('[Database] Supabase initialization notice:', err.message);
        this.supabase = null;
        this.isConnected = false;
      }
    } else {
      this.supabase = null;
      this.isConnected = false;
    }

    if (saveToDisk) {
      writeJson(CONFIG_FILE, { url: this.url, key: this.key, updated_at: new Date().toISOString() });
    }
  }

  async testConnection() {
    if (!this.supabase) {
      return { connected: false, message: 'Supabase URL and API Key are not configured.' };
    }
    try {
      const { data, error } = await this.supabase.from('products').select('id').limit(1);
      if (error) {
        return { connected: false, message: `Supabase responded: ${error.message}` };
      }
      this.isConnected = true;
      return { connected: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
    } catch (err) {
      return { connected: false, message: `Connection failed: ${err.message}` };
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      provider: this.isConnected ? 'supabase' : 'local_json_cache',
      url: this.url ? this.url.replace(/\.co.*/, '.co') : '',
      hasKey: Boolean(this.key)
    };
  }

  // ========================
  // PRODUCTS
  // ========================
  async getProducts(filters = {}) {
    const { category, search, sort } = filters;

    // Try Supabase first if connected
    if (this.isConnected && this.supabase) {
      try {
        let query = this.supabase.from('products').select('*');

        if (category && category.toLowerCase() !== 'all') {
          query = query.ilike('category', category);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
        }
        if (sort === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (sort === 'price-desc') {
          query = query.order('price', { ascending: false });
        } else if (sort === 'stock-desc') {
          query = query.order('stock', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          // Normalize format
          const formatted = data.map(item => ({
            ...item,
            sizeStock: item.size_stock || item.sizeStock || {}
          }));
          // Sync to local cache
          writeJson(PRODUCTS_FILE, formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase query error, using local cache:', err.message);
      }
    }

    // Local JSON Cache Fallback
    let products = readJson(PRODUCTS_FILE, []);
    if (category && category.toLowerCase() !== 'all') {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (sort === 'stock-desc') products.sort((a, b) => b.stock - a.stock);
    else products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return products;
  }

  async getProductById(id) {
    if (this.isConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            ...data,
            sizeStock: data.size_stock || data.sizeStock || {}
          };
        }
      } catch (e) {
        console.warn('Supabase getProductById note:', e.message);
      }
    }
    const products = readJson(PRODUCTS_FILE, []);
    return products.find(p => p.id === id) || null;
  }

  async addProduct(product) {
    // Save to local cache first
    const products = readJson(PRODUCTS_FILE, []);
    products.unshift(product);
    writeJson(PRODUCTS_FILE, products);

    // Sync to Supabase
    if (this.isConnected && this.supabase) {
      try {
        const payload = {
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          description: product.description,
          image: product.image,
          color: product.color,
          stock: product.stock,
          sizes: product.sizes,
          size_stock: product.sizeStock,
          badge: product.badge,
          created_at: product.created_at || new Date().toISOString()
        };
        await this.supabase.from('products').insert([payload]);
      } catch (err) {
        console.warn('Supabase product sync notice:', err.message);
      }
    }

    return product;
  }

  async updateProduct(id, updatedProduct) {
    const products = readJson(PRODUCTS_FILE, []);
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = updatedProduct;
      writeJson(PRODUCTS_FILE, products);
    }

    if (this.isConnected && this.supabase) {
      try {
        const payload = {
          title: updatedProduct.title,
          category: updatedProduct.category,
          price: updatedProduct.price,
          description: updatedProduct.description,
          image: updatedProduct.image,
          color: updatedProduct.color,
          stock: updatedProduct.stock,
          sizes: updatedProduct.sizes,
          size_stock: updatedProduct.sizeStock,
          badge: updatedProduct.badge,
          updated_at: new Date().toISOString()
        };
        await this.supabase.from('products').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase product update notice:', err.message);
      }
    }

    return updatedProduct;
  }

  async deleteProduct(id) {
    let products = readJson(PRODUCTS_FILE, []);
    products = products.filter(p => p.id !== id);
    writeJson(PRODUCTS_FILE, products);

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase product delete notice:', err.message);
      }
    }
    return true;
  }

  async resetProducts(defaults) {
    writeJson(PRODUCTS_FILE, defaults);

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('products').delete().neq('id', 'placeholder');
        const rows = defaults.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category,
          price: d.price,
          description: d.description,
          image: d.image,
          color: d.color,
          stock: d.stock,
          sizes: d.sizes,
          size_stock: d.sizeStock,
          badge: d.badge,
          created_at: d.created_at
        }));
        await this.supabase.from('products').insert(rows);
      } catch (err) {
        console.warn('Supabase reset notice:', err.message);
      }
    }
    return defaults;
  }

  // ========================
  // ORDERS
  // ========================
  async getOrders() {
    if (this.isConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          writeJson(ORDERS_FILE, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase getOrders note:', e.message);
      }
    }
    const orders = readJson(ORDERS_FILE, []);
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return orders;
  }

  async addOrder(order) {
    const orders = readJson(ORDERS_FILE, []);
    orders.unshift(order);
    writeJson(ORDERS_FILE, orders);

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('orders').insert([order]);
      } catch (err) {
        console.warn('Supabase addOrder notice:', err.message);
      }
    }
    return order;
  }

  async updateOrderStatus(id, status) {
    const orders = readJson(ORDERS_FILE, []);
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      writeJson(ORDERS_FILE, orders);
    }

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('orders').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateOrderStatus notice:', err.message);
      }
    }
    return order;
  }

  // ========================
  // SUBSCRIBERS
  // ========================
  async getSubscribers() {
    if (this.isConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          writeJson(SUBSCRIBERS_FILE, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase getSubscribers note:', e.message);
      }
    }
    return readJson(SUBSCRIBERS_FILE, []);
  }

  async saveSubscriber(email, name = '', source = 'checkout') {
    if (!email || !email.includes('@')) return null;
    const cleanEmail = email.trim().toLowerCase();
    const subscribers = readJson(SUBSCRIBERS_FILE, []);

    let subscriber = subscribers.find(s => s.email.toLowerCase() === cleanEmail);
    const now = new Date().toISOString();

    if (subscriber) {
      if (source === 'checkout') subscriber.orders_count = (subscriber.orders_count || 0) + 1;
      if (name) subscriber.name = name;
    } else {
      subscriber = {
        email: cleanEmail,
        name: name || 'Fashion Disciple',
        source: source,
        subscribed_at: now,
        orders_count: source === 'checkout' ? 1 : 0,
        last_notified: null
      };
      subscribers.unshift(subscriber);
    }
    writeJson(SUBSCRIBERS_FILE, subscribers);

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('subscribers').upsert([subscriber]);
      } catch (err) {
        console.warn('Supabase saveSubscriber notice:', err.message);
      }
    }
    return subscriber;
  }

  async deleteSubscriber(email) {
    let subscribers = readJson(SUBSCRIBERS_FILE, []);
    subscribers = subscribers.filter(s => s.email.toLowerCase() !== email.toLowerCase());
    writeJson(SUBSCRIBERS_FILE, subscribers);

    if (this.isConnected && this.supabase) {
      try {
        await this.supabase.from('subscribers').delete().eq('email', email.toLowerCase());
      } catch (err) {
        console.warn('Supabase deleteSubscriber notice:', err.message);
      }
    }
    return true;
  }

  // ========================
  // EMAIL LOGS
  // ========================
  async getEmailLogs() {
    if (this.isConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('email_logs').select('*').order('sent_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          writeJson(EMAIL_LOGS_FILE, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase getEmailLogs note:', e.message);
      }
    }
    return readJson(EMAIL_LOGS_FILE, []);
  }

  async saveEmailLog(log) {
    const logs = readJson(EMAIL_LOGS_FILE, []);
    logs.unshift(log);
    writeJson(EMAIL_LOGS_FILE, logs);

    if (this.isConnected && this.supabase) {
      try {
        const payload = {
          id: log.id,
          type: log.type,
          subject: log.subject,
          recipients_count: log.recipientsCount || (log.recipients ? log.recipients.length : 0),
          recipients: log.recipients,
          product: log.product,
          html_preview: log.htmlPreview,
          status: log.status,
          sent_at: log.sent_at
        };
        await this.supabase.from('email_logs').insert([payload]);
      } catch (err) {
        console.warn('Supabase saveEmailLog notice:', err.message);
      }
    }
    return log;
  }

  // ========================
  // DATABASE SYNC (Local -> Supabase)
  // ========================
  async syncLocalToSupabase() {
    if (!this.isConnected || !this.supabase) {
      return { success: false, message: 'Supabase is not connected. Configure URL and Key first.' };
    }
    try {
      const products = readJson(PRODUCTS_FILE, []);
      const orders = readJson(ORDERS_FILE, []);
      const subscribers = readJson(SUBSCRIBERS_FILE, []);
      const logs = readJson(EMAIL_LOGS_FILE, []);

      // 1. Sync Products
      if (products.length) {
        const rows = products.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          description: p.description,
          image: p.image,
          color: p.color,
          stock: p.stock,
          sizes: p.sizes,
          size_stock: p.sizeStock,
          badge: p.badge,
          created_at: p.created_at || new Date().toISOString()
        }));
        await this.supabase.from('products').upsert(rows);
      }

      // 2. Sync Orders
      if (orders.length) {
        await this.supabase.from('orders').upsert(orders);
      }

      // 3. Sync Subscribers
      if (subscribers.length) {
        await this.supabase.from('subscribers').upsert(subscribers);
      }

      // 4. Sync Logs
      if (logs.length) {
        const logRows = logs.map(l => ({
          id: l.id,
          type: l.type,
          subject: l.subject,
          recipients_count: l.recipientsCount || (l.recipients ? l.recipients.length : 0),
          recipients: l.recipients,
          product: l.product,
          html_preview: l.htmlPreview,
          status: l.status,
          sent_at: l.sent_at
        }));
        await this.supabase.from('email_logs').upsert(logRows);
      }

      return {
        success: true,
        message: 'All local products, orders, subscribers, and drop campaign logs successfully synced to Supabase!',
        synced: {
          products: products.length,
          orders: orders.length,
          subscribers: subscribers.length,
          emailLogs: logs.length
        }
      };
    } catch (err) {
      console.error('Supabase sync error:', err);
      return { success: false, message: `Sync error: ${err.message}` };
    }
  }
}

const db = new DatabaseManager();
module.exports = db;
