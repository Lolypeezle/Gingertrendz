-- ====================================================================
-- GINGERTRENDZ - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this script in your Supabase Project's "SQL Editor"
-- ====================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    color TEXT DEFAULT '#D4772C',
    stock INTEGER DEFAULT 10,
    sizes JSONB DEFAULT '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    size_stock JSONB DEFAULT '{"XS": 3, "S": 5, "M": 7, "L": 5, "XL": 3, "XXL": 1}'::jsonb,
    badge TEXT DEFAULT 'Atelier Drop',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    shipping NUMERIC NOT NULL DEFAULT 5000,
    total NUMERIC NOT NULL,
    method TEXT DEFAULT 'Standard Courier Delivery',
    status TEXT DEFAULT 'Processing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMAIL SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    email TEXT PRIMARY KEY,
    name TEXT DEFAULT 'Fashion Disciple',
    source TEXT DEFAULT 'checkout',
    orders_count INTEGER DEFAULT 1,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    last_notified TIMESTAMPTZ
);

-- 4. EMAIL CAMPAIGN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'drop_announcement',
    subject TEXT NOT NULL,
    recipients_count INTEGER DEFAULT 0,
    recipients JSONB DEFAULT '[]'::jsonb,
    product JSONB,
    html_preview TEXT,
    status TEXT DEFAULT 'Dispatched',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for Storefront
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view their own order" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can subscribe emails" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view subscribers count" ON public.subscribers FOR SELECT USING (true);

-- Allow Full Access with Anon/Service Role Key
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Full access subscribers" ON public.subscribers FOR ALL USING (true);
CREATE POLICY "Full access email_logs" ON public.email_logs FOR ALL USING (true);

-- 5. SEED INITIAL PRODUCTS (THE FASHION DISCIPLES DROP '26)
INSERT INTO public.products (id, title, category, price, description, image, color, stock, sizes, size_stock, badge)
VALUES
(
    'gt-001',
    'Gingertrendz Heavyweight Atelier Hoodie',
    'Hoodies',
    48000,
    'Engineered from 520GSM combed organic loopback French terry. Cut in an oversized, relaxed drop-shoulder silhouette with double-layered hood and tonal embroidered brand signature.',
    'assets/images/product_hoodie_1793575280654.jpg',
    '#D4772C',
    24,
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    '{"XS": 3, "S": 5, "M": 7, "L": 5, "XL": 3, "XXL": 1}'::jsonb,
    'Signature Drop'
),
(
    'gt-002',
    'Terracotta Belted Overcoat Trench',
    'Outerwear',
    75000,
    'Double-breasted trench crafted from heavyweight Italian wool-blend gabardine in rich terracotta rust. Features a structured storm flap, horn buckles, and deep side welt pockets.',
    'assets/images/product_jacket_1793575295368.jpg',
    '#943D1A',
    14,
    '["S", "M", "L", "XL"]'::jsonb,
    '{"S": 2, "M": 5, "L": 4, "XL": 3}'::jsonb,
    'Limited Edition'
),
(
    'gt-003',
    'Gloss Ginger Quilted Puffer Jacket',
    'Outerwear',
    68000,
    'Water-repellent ripstop shell stuffed with sustainably sourced 700-fill down alternative. Features a high insulated funnel neck, storm cuffs, and matte gunmetal zipper hardware.',
    'assets/images/product_puffer_1793575627533.jpg',
    '#B85523',
    18,
    '["XS", "S", "M", "L", "XL"]'::jsonb,
    '{"XS": 2, "S": 4, "M": 6, "L": 4, "XL": 2}'::jsonb,
    'Winter Drop'
),
(
    'gt-004',
    'Chunky Ribbed Ginger Knit Sweater',
    'Hoodies',
    42000,
    'Chunky fisherman knit spun from 100% Australian merino wool blend. Features dropped shoulders, thick ribbed collar, and raw-textured sleeve hems for an effortless architectural drape.',
    'assets/images/product_knit_1793575650504.jpg',
    '#C45B25',
    20,
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    '{"XS": 3, "S": 4, "M": 6, "L": 4, "XL": 2, "XXL": 1}'::jsonb,
    'Trending'
),
(
    'gt-005',
    'Pleated Wide-Leg Studio Trouser',
    'Pants',
    38000,
    'Tailored double-pleated relaxed trousers in deep volcanic charcoal with amber stitching accents. High-waisted drape with discreet elastic back waistband and tailored cuff break.',
    'assets/images/hero_banner_1793575264897.jpg',
    '#2D2622',
    15,
    '["S", "M", "L", "XL"]'::jsonb,
    '{"S": 3, "M": 5, "L": 5, "XL": 2}'::jsonb,
    'Atelier'
),
(
    'gt-006',
    'Vintage Washed Box Tee - Ginger Monogram',
    'Tees',
    24000,
    'Heavy 280GSM ring-spun cotton tee with custom mineral wash. Finished with subtle distressed collar edge, wide boxy sleeves, and blind-stitched hem.',
    'assets/images/product_hoodie_1793575280654.jpg',
    '#1C1714',
    30,
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    '{"XS": 4, "S": 6, "M": 8, "L": 6, "XL": 4, "XXL": 2}'::jsonb,
    'Essential'
)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED INITIAL SUBSCRIBERS
INSERT INTO public.subscribers (email, name, source, orders_count)
VALUES
('tari.eze@example.com', 'Tari Eze', 'checkout', 1),
('zainab.b@example.com', 'Zainab Bello', 'checkout', 1),
('chinedu.o@example.com', 'Chinedu Okafor', 'checkout', 1)
ON CONFLICT (email) DO NOTHING;
