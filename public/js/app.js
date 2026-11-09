/**
 * GINGERTRENDZ - Luxury Editorial Boutique Storefront Engine
 * Communicates with Node.js Express REST API
 */

const StoreApp = {
  products: [],
  cart: [],
  selectedProduct: null,
  selectedSize: null,
  selectedQty: 1,
  currentCategory: 'all',
  shippingFee: 5000,
  adminLoggedIn: false,

  elements: {},

  async init() {
    this.cacheElements();
    this.loadCartFromStorage();
    this.bindEvents();
    this.checkAdminSession();
    await this.loadProducts();
    this.updateCartUI();

    // Initialize admin app if present
    if (window.AdminApp) {
      window.AdminApp.init();
    }
  },

  cacheElements() {
    this.elements = {
      // Views
      views: {
        storefront: document.getElementById('storefront-view'),
        checkout: document.getElementById('checkout-view'),
        success: document.getElementById('success-view'),
        adminLogin: document.getElementById('admin-login-view'),
        adminDashboard: document.getElementById('admin-view')
      },

      // Navigation
      navLogo: document.getElementById('nav-logo'),
      navShop: document.getElementById('nav-shop'),
      navAdmin: document.getElementById('nav-admin'),
      cartBtn: document.getElementById('cart-btn'),
      cartCount: document.getElementById('cart-count'),
      mobileCartCount: document.getElementById('mobile-cart-count'),

      // Storefront Elements
      productsGrid: document.getElementById('products-grid'),
      categoryChips: document.querySelectorAll('#category-filter-container .category-chip'),
      searchInput: document.getElementById('search-input'),
      sortSelect: document.getElementById('sort-select'),
      heroShopBtn: document.getElementById('hero-shop-btn'),

      // Drawers & Overlays
      drawerOverlay: document.getElementById('drawer-overlay'),
      detailDrawer: document.getElementById('product-detail-drawer'),
      detailClose: document.getElementById('detail-drawer-close'),
      cartDrawer: document.getElementById('cart-drawer'),
      cartClose: document.getElementById('cart-drawer-close'),
      cartContinueBtn: document.getElementById('cart-continue-btn'),

      // Product Detail Drawer Elements
      detailImage: document.getElementById('detail-image-container'),
      detailCategory: document.getElementById('detail-category'),
      detailBadge: document.getElementById('detail-badge'),
      detailTitle: document.getElementById('detail-title'),
      detailPrice: document.getElementById('detail-price'),
      detailDescription: document.getElementById('detail-description'),
      detailSizes: document.getElementById('detail-sizes-container'),
      detailSizeLabel: document.getElementById('detail-size-selected-label'),
      detailQtyMinus: document.getElementById('detail-qty-minus'),
      detailQtyPlus: document.getElementById('detail-qty-plus'),
      detailQtyVal: document.getElementById('detail-qty-val'),
      detailAddBtn: document.getElementById('add-to-cart-drawer-btn'),
      detailStock: document.getElementById('detail-stock-status'),
      sizeGuideToggle: document.getElementById('drawer-size-guide-toggle'),
      sizeGuideModal: document.getElementById('size-guide-modal-overlay'),
      sizeGuideClose: document.getElementById('size-guide-modal-close'),

      // Cart Drawer Elements
      cartItems: document.getElementById('cart-items-container'),
      cartCountLabel: document.getElementById('cart-items-count-label'),
      shippingProgressBar: document.getElementById('shipping-progress-bar'),
      shippingProgressText: document.getElementById('shipping-progress-text'),
      cartSubtotal: document.getElementById('cart-subtotal'),
      cartShipping: document.getElementById('cart-shipping'),
      cartTotal: document.getElementById('cart-total'),
      cartCheckoutBtn: document.getElementById('cart-checkout-btn'),

      // Checkout Elements
      checkoutForm: document.getElementById('checkout-details-form'),
      checkoutItems: document.getElementById('checkout-summary-items'),
      checkoutSubtotal: document.getElementById('checkout-subtotal'),
      checkoutDelivery: document.getElementById('checkout-delivery'),
      checkoutTotal: document.getElementById('checkout-total'),
      btnProceedPayment: document.getElementById('proceed-payment-btn'),
      btnCancelCheckout: document.getElementById('cancel-checkout-btn'),
      btnCancelCheckoutTop: document.getElementById('cancel-checkout-top-btn'),
      shippingMethodRadios: document.querySelectorAll('input[name="shipping-method"]'),

      // Receipt Elements
      receiptRef: document.getElementById('receipt-ref'),
      receiptDate: document.getElementById('receipt-date'),
      receiptMethod: document.getElementById('receipt-method'),
      receiptCustomer: document.getElementById('receipt-customer'),
      receiptAddress: document.getElementById('receipt-address'),
      receiptSubtotal: document.getElementById('receipt-subtotal'),
      receiptShipping: document.getElementById('receipt-shipping'),
      receiptTotal: document.getElementById('receipt-total'),
      btnSuccessShop: document.getElementById('success-shop-btn'),

      // Admin Login Elements
      adminLoginForm: document.getElementById('admin-login-form'),
      adminEmail: document.getElementById('admin-email'),
      adminPassword: document.getElementById('admin-password'),
      loginError: document.getElementById('login-error-msg'),
      btnQuickFillAdmin: document.getElementById('btn-quick-fill-admin'),
      btnBackToShop: document.getElementById('btn-back-to-shop'),

      // Payment Confirmation Modal
      paymentModal: document.getElementById('payment-confirmation-modal'),
      toastHub: document.getElementById('toast-hub')
    };
  },

  bindEvents() {
    // Navigation link handling
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = link.getAttribute('data-view');
        if (view) {
          e.preventDefault();
          if (view === 'storefront-view') {
            this.showView('storefront');
          } else if (view === 'admin-login-view') {
            if (this.adminLoggedIn) {
              this.showView('adminDashboard');
              if (window.AdminApp) window.AdminApp.loadDashboard();
            } else {
              this.showView('adminLogin');
            }
          }
        }
      });
    });

    // Logo click returns to storefront
    if (this.elements.navLogo) {
      this.elements.navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
        this.showView('storefront');
      });
    }

    // Direct hash routing (#admin, #portal, #login)
    const handleHash = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash === '#admin' || hash === '#portal' || hash === '#login') {
        if (this.adminLoggedIn) {
          this.showView('adminDashboard');
          if (window.AdminApp) window.AdminApp.loadDashboard();
        } else {
          this.showView('adminLogin');
        }
      } else if (hash === '#shop' || hash === '#storefront') {
        this.showView('storefront');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Discreet shortcut: Ctrl + Shift + A to open Admin Gate
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.hash = '#admin';
      }
    });

    // Hero explore button
    if (this.elements.heroShopBtn) {
      this.elements.heroShopBtn.addEventListener('click', () => {
        const controls = document.getElementById('category-filter-container');
        if (controls) controls.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Category chips
    this.elements.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.elements.categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-category');
        this.loadProducts();
      });
    });

    // Search input
    let searchTimeout;
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.loadProducts();
        }, 300);
      });
    }

    // Sort Select
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', () => {
        this.loadProducts();
      });
    }

    // Cart toggles & drawers
    if (this.elements.cartBtn) {
      this.elements.cartBtn.addEventListener('click', () => this.toggleCartDrawer(true));
    }

    const mobileCartLink = document.getElementById('mobile-cart-link');
    if (mobileCartLink) {
      mobileCartLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCartDrawer(true);
      });
    }

    if (this.elements.cartClose) {
      this.elements.cartClose.addEventListener('click', () => this.toggleCartDrawer(false));
    }
    if (this.elements.cartContinueBtn) {
      this.elements.cartContinueBtn.addEventListener('click', () => this.toggleCartDrawer(false));
    }

    if (this.elements.detailClose) {
      this.elements.detailClose.addEventListener('click', () => this.toggleDetailDrawer(false));
    }

    if (this.elements.drawerOverlay) {
      this.elements.drawerOverlay.addEventListener('click', () => {
        this.toggleCartDrawer(false);
        this.toggleDetailDrawer(false);
      });
    }

    // Quantity Stepper in detail drawer
    if (this.elements.detailQtyMinus) {
      this.elements.detailQtyMinus.addEventListener('click', () => {
        if (this.selectedQty > 1) {
          this.selectedQty--;
          this.elements.detailQtyVal.textContent = this.selectedQty;
        }
      });
    }

    if (this.elements.detailQtyPlus) {
      this.elements.detailQtyPlus.addEventListener('click', () => {
        if (this.selectedProduct) {
          const sizeStock = (this.selectedProduct.sizeStock && this.selectedProduct.sizeStock[this.selectedSize]) || 10;
          if (this.selectedQty < sizeStock) {
            this.selectedQty++;
            this.elements.detailQtyVal.textContent = this.selectedQty;
          } else {
            this.showToast(`Maximum available stock (${sizeStock}) reached for size ${this.selectedSize}`);
          }
        }
      });
    }

    // Add to cart from detail drawer
    if (this.elements.detailAddBtn) {
      this.elements.detailAddBtn.addEventListener('click', () => {
        if (!this.selectedProduct) return;
        if (!this.selectedSize) {
          this.showToast('Please select a garment size first');
          return;
        }
        this.addToCart(this.selectedProduct, this.selectedSize, this.selectedQty);
        this.toggleDetailDrawer(false);
        this.toggleCartDrawer(true);
      });
    }

    // Size Guide modal toggle
    if (this.elements.sizeGuideToggle && this.elements.sizeGuideModal) {
      this.elements.sizeGuideToggle.addEventListener('click', () => {
        this.elements.sizeGuideModal.classList.add('active');
      });
    }
    const footerSizeGuide = document.getElementById('footer-size-guide-link');
    if (footerSizeGuide && this.elements.sizeGuideModal) {
      footerSizeGuide.addEventListener('click', (e) => {
        e.preventDefault();
        this.elements.sizeGuideModal.classList.add('active');
      });
    }
    if (this.elements.sizeGuideClose && this.elements.sizeGuideModal) {
      this.elements.sizeGuideClose.addEventListener('click', () => {
        this.elements.sizeGuideModal.classList.remove('active');
      });
    }

    // Cart checkout button
    if (this.elements.cartCheckoutBtn) {
      this.elements.cartCheckoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) {
          this.showToast('Your bag is currently empty.');
          return;
        }
        this.toggleCartDrawer(false);
        this.openCheckout();
      });
    }

    // Checkout Cancel Buttons
    if (this.elements.btnCancelCheckout) {
      this.elements.btnCancelCheckout.addEventListener('click', () => this.showView('storefront'));
    }
    if (this.elements.btnCancelCheckoutTop) {
      this.elements.btnCancelCheckoutTop.addEventListener('click', () => this.showView('storefront'));
    }

    // Shipping method change in checkout
    this.elements.shippingMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.elements.shippingMethodRadios.forEach(r => {
          r.closest('.shipping-option-card').classList.toggle('active', r.checked);
        });
        this.shippingFee = Number(radio.value);
        this.updateCheckoutTotals();
      });
    });

    // Proceed to Payment / Place Order
    if (this.elements.btnProceedPayment) {
      this.elements.btnProceedPayment.addEventListener('click', () => {
        this.handleCheckoutSubmit();
      });
    }

    // Success continue shopping
    if (this.elements.btnSuccessShop) {
      this.elements.btnSuccessShop.addEventListener('click', () => {
        this.showView('storefront');
      });
    }

    // Admin login form submit
    if (this.elements.adminLoginForm) {
      this.elements.adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdminLogin();
      });
    }

    // Admin quick fill demo credentials
    if (this.elements.btnQuickFillAdmin) {
      this.elements.btnQuickFillAdmin.addEventListener('click', () => {
        this.elements.adminEmail.value = 'admin@gingertrendz.com';
        this.elements.adminPassword.value = 'admin123';
        if (this.elements.loginError) this.elements.loginError.classList.remove('active');
      });
    }

    if (this.elements.btnBackToShop) {
      this.elements.btnBackToShop.addEventListener('click', () => {
        this.showView('storefront');
      });
    }

    // Footer filter links
    document.querySelectorAll('.footer-filter-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-category');
        this.showView('storefront');
        this.elements.categoryChips.forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-category') === cat);
        });
        this.currentCategory = cat;
        this.loadProducts();
        window.scrollTo({ top: 500, behavior: 'smooth' });
      });
    });

    // VIP Newsletter Drop Alert Subscription Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        try {
          const res = await fetch('/api/subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'vip_newsletter' })
          });
          const data = await res.json();
          if (data.success) {
            emailInput.value = '';
            this.showToast('✦ Subscribed! You will receive email alerts on every new garment drop.');
          }
        } catch (err) {
          this.showToast('✦ Welcome to The Fashion Disciples VIP Drop list.');
        }
      });
    }
  },

  checkAdminSession() {
    const token = localStorage.getItem('gt_admin_token');
    if (token) {
      this.adminLoggedIn = true;
    }
  },

  showView(viewKey) {
    Object.keys(this.elements.views).forEach(k => {
      if (this.elements.views[k]) {
        this.elements.views[k].classList.toggle('active', k === viewKey);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update nav link active state
    if (this.elements.navShop) this.elements.navShop.classList.toggle('active', viewKey === 'storefront');
    if (this.elements.navAdmin) this.elements.navAdmin.classList.toggle('active', viewKey === 'adminDashboard' || viewKey === 'adminLogin');
  },

  toggleCartDrawer(open) {
    if (this.elements.cartDrawer) this.elements.cartDrawer.classList.toggle('active', open);
    if (this.elements.drawerOverlay) this.elements.drawerOverlay.classList.toggle('active', open);
    if (open) {
      this.renderCartItems();
    }
  },

  toggleDetailDrawer(open) {
    if (this.elements.detailDrawer) this.elements.detailDrawer.classList.toggle('active', open);
    if (this.elements.drawerOverlay) this.elements.drawerOverlay.classList.toggle('active', open);
  },

  // API Call: Load Products
  async loadProducts() {
    const category = this.currentCategory || 'all';
    const search = this.elements.searchInput ? this.elements.searchInput.value.trim() : '';
    const sort = this.elements.sortSelect ? this.elements.sortSelect.value : 'default';

    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (sort && sort !== 'default') params.append('sort', sort);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        this.products = data.products;
        this.renderProductsGrid();
      }
    } catch (err) {
      console.warn('API error, falling back to local dataset:', err);
    }
  },

  renderProductsGrid() {
    const container = this.elements.productsGrid;
    if (!container) return;

    if (!this.products.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <p style="font-size: 18px; margin-bottom: 10px;">No garments found matching this selection.</p>
          <button class="btn btn-secondary" onclick="StoreApp.resetFilters()">View All Garments</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.products.map(p => {
      const sizes = p.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const sizeStock = p.sizeStock || {};

      const quickSizesHtml = sizes.map(s => {
        const isSoldOut = sizeStock[s] === 0;
        return `<span class="size-pill-mini ${isSoldOut ? 'sold-out' : ''}">${s}</span>`;
      }).join('');

      const totalStock = p.stock || 0;
      let stockTag = `${totalStock} in stock`;
      if (totalStock === 0) stockTag = 'Sold Out';
      else if (totalStock <= 5) stockTag = `Only ${totalStock} left`;

      return `
        <div class="product-card" onclick="StoreApp.openProductDetail('${p.id}')">
          <div class="product-image-wrap">
            <span class="product-card-badge">${p.badge || 'Atelier'}</span>
            <img src="${p.image}" class="product-img" alt="${p.title}" loading="lazy" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
            <div class="product-card-quick-sizes">
              ${quickSizesHtml}
            </div>
          </div>
          <div class="product-info">
            <div class="product-meta-row">
              <span class="product-cat">${p.category}</span>
              <span class="product-stock-tag">${stockTag}</span>
            </div>
            <h2 class="product-title">${p.title}</h2>
            <div class="product-bottom-row">
              <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
              <button class="btn-card-view" onclick="event.stopPropagation(); StoreApp.openProductDetail('${p.id}')">View Specs</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetFilters() {
    this.currentCategory = 'all';
    this.elements.categoryChips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-category') === 'all');
    });
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.sortSelect) this.elements.sortSelect.value = 'default';
    this.loadProducts();
  },

  // Open Product Detail Drawer
  openProductDetail(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.selectedProduct = product;
    this.selectedQty = 1;
    this.elements.detailQtyVal.textContent = 1;

    // Fill Details
    this.elements.detailImage.innerHTML = `
      <img src="${product.image}" class="detail-img" alt="${product.title}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
    `;
    this.elements.detailCategory.textContent = product.category;
    this.elements.detailBadge.textContent = product.badge || 'Essential';
    this.elements.detailTitle.textContent = product.title;
    this.elements.detailPrice.textContent = '₦' + Number(product.price).toLocaleString();
    this.elements.detailDescription.textContent = product.description;

    // Render Size Chips
    const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeStock = product.sizeStock || {};

    // Select first in-stock size by default
    let firstAvailableSize = null;
    const sizesHtml = sizes.map(size => {
      const stock = sizeStock[size] !== undefined ? sizeStock[size] : 5;
      const isOut = stock === 0;

      if (!isOut && !firstAvailableSize) {
        firstAvailableSize = size;
      }

      let stockNote = `${stock} left`;
      if (isOut) stockNote = 'Sold out';
      else if (stock > 10) stockNote = 'In stock';

      return `
        <div class="size-chip ${isOut ? 'out-of-stock' : ''}" data-size="${size}" onclick="StoreApp.selectDetailSize('${size}', ${stock})">
          <span class="size-chip-name">${size}</span>
          <span class="size-chip-stock">${stockNote}</span>
        </div>
      `;
    }).join('');

    this.elements.detailSizes.innerHTML = sizesHtml;

    if (firstAvailableSize) {
      this.selectDetailSize(firstAvailableSize, sizeStock[firstAvailableSize] || 5);
    } else {
      this.selectedSize = null;
      this.elements.detailSizeLabel.textContent = 'All sizes currently sold out';
      this.elements.detailStock.textContent = 'Out of Stock';
      this.elements.detailStock.style.color = 'var(--error)';
      this.elements.detailAddBtn.disabled = true;
    }

    this.toggleDetailDrawer(true);
  },

  selectDetailSize(size, stock) {
    if (stock === 0) {
      this.showToast(`Size ${size} is currently sold out.`);
      return;
    }

    this.selectedSize = size;

    document.querySelectorAll('#detail-sizes-container .size-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-size') === size);
    });

    this.elements.detailSizeLabel.textContent = `Selected Size: ${size} (${stock} available)`;
    this.elements.detailStock.textContent = `${stock} pieces ready for immediate dispatch`;
    this.elements.detailStock.style.color = 'var(--success)';
    this.elements.detailAddBtn.disabled = false;
  },

  // CART LOGIC
  loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('gt_cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      }
    } catch (e) {
      this.cart = [];
    }
  },

  saveCartToStorage() {
    try {
      localStorage.setItem('gt_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.updateCartUI();
  },

  addToCart(product, size, qty = 1) {
    const existingIndex = this.cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += qty;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        color: product.color,
        size: size,
        quantity: qty
      });
    }

    this.saveCartToStorage();
    this.showToast(`Added ${qty}× ${product.title} (Size: ${size}) to Bag`);
  },

  updateCartItemQty(index, delta) {
    if (!this.cart[index]) return;
    this.cart[index].quantity += delta;

    if (this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
      this.showToast('Item removed from shopping bag');
    }

    this.saveCartToStorage();
    this.renderCartItems();
  },

  removeCartItem(index) {
    if (!this.cart[index]) return;
    const item = this.cart[index];
    this.cart.splice(index, 1);
    this.saveCartToStorage();
    this.renderCartItems();
    this.showToast(`Removed ${item.title} (${item.size}) from bag`);
  },

  updateCartUI() {
    const totalQty = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (this.elements.cartCount) this.elements.cartCount.textContent = totalQty;
    if (this.elements.mobileCartCount) this.elements.mobileCartCount.textContent = totalQty;
    if (this.elements.cartCountLabel) this.elements.cartCountLabel.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
  },

  renderCartItems() {
    const container = this.elements.cartItems;
    if (!container) return;

    if (!this.cart.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p style="font-size: 16px; margin-bottom: 14px;">Your bag is empty.</p>
          <button class="btn btn-secondary" onclick="StoreApp.toggleCartDrawer(false)">Explore Lookbook</button>
        </div>
      `;
      this.elements.cartSubtotal.textContent = '₦0';
      this.elements.cartShipping.textContent = '₦0';
      this.elements.cartTotal.textContent = '₦0';
      this.elements.shippingProgressBar.style.width = '0%';
      this.elements.shippingProgressText.textContent = 'Add ₦120,000 for Complimentary Dispatch';
      return;
    }

    container.innerHTML = this.cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
        </div>
        <div class="cart-item-info">
          <span class="cart-item-title">${item.title}</span>
          <div class="cart-item-meta">
            <span class="cart-size-pill">Size: ${item.size}</span>
          </div>
          <span class="cart-item-price">₦${Number(item.price * item.quantity).toLocaleString()}</span>
          <div class="cart-item-controls">
            <div class="quantity-stepper" style="transform: scale(0.85); transform-origin: left;">
              <button type="button" class="qty-btn" onclick="StoreApp.updateCartItemQty(${idx}, -1)">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="StoreApp.updateCartItemQty(${idx}, 1)">+</button>
            </div>
            <button class="cart-item-remove-btn" onclick="StoreApp.removeCartItem(${idx})">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 120000 ? 0 : this.shippingFee;
    const total = subtotal + shipping;

    this.elements.cartSubtotal.textContent = '₦' + subtotal.toLocaleString();
    this.elements.cartShipping.textContent = shipping === 0 ? 'Complimentary' : '₦' + shipping.toLocaleString();
    this.elements.cartTotal.textContent = '₦' + total.toLocaleString();

    // Free shipping threshold: ₦120,000
    const progressPercent = Math.min(100, Math.round((subtotal / 120000) * 100));
    this.elements.shippingProgressBar.style.width = progressPercent + '%';

    if (subtotal >= 120000) {
      this.elements.shippingProgressText.textContent = '✨ You unlocked Complimentary Nationwide Dispatch!';
    } else {
      const remaining = 120000 - subtotal;
      this.elements.shippingProgressText.textContent = `Add ₦${remaining.toLocaleString()} more for Complimentary Dispatch`;
    }
  },

  // CHECKOUT
  openCheckout() {
    this.showView('checkout');

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.shippingFee = subtotal >= 120000 ? 0 : 5000;

    // Render items list in sidebar
    this.elements.checkoutItems.innerHTML = this.cart.map(item => `
      <div class="summary-item-row">
        <div>
          <div class="summary-item-title">${item.title}</div>
          <div class="summary-item-detail">Size: <strong>${item.size}</strong> × ${item.quantity}</div>
        </div>
        <div style="font-weight: 600;">₦${Number(item.price * item.quantity).toLocaleString()}</div>
      </div>
    `).join('');

    this.updateCheckoutTotals();
  },

  updateCheckoutTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 120000 ? 0 : this.shippingFee;
    const total = subtotal + shipping;

    this.elements.checkoutSubtotal.textContent = '₦' + subtotal.toLocaleString();
    this.elements.checkoutDelivery.textContent = shipping === 0 ? 'Complimentary' : '₦' + shipping.toLocaleString();
    this.elements.checkoutTotal.textContent = '₦' + total.toLocaleString();
  },

  async handleCheckoutSubmit() {
    const form = this.elements.checkoutForm;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('shipping-email').value.trim();
    const phone = document.getElementById('shipping-phone').value.trim();
    const address = document.getElementById('shipping-address').value.trim();
    const city = document.getElementById('shipping-city').value.trim();
    const state = document.getElementById('shipping-state').value;

    const selectedShippingInput = document.querySelector('input[name="shipping-method"]:checked');
    const shippingMethodTitle = selectedShippingInput
      ? selectedShippingInput.closest('.shipping-option-card').querySelector('.shipping-option-title').textContent
      : 'Standard Courier Delivery';

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 120000 ? 0 : this.shippingFee;
    const grandTotal = subtotal + shipping;

    const subscribeCheckbox = document.getElementById('checkout-subscribe-email');
    const subscribeEmail = subscribeCheckbox ? subscribeCheckbox.checked : true;

    const orderPayload = {
      customer: { firstName, lastName, email, phone, address, city, state },
      items: this.cart,
      subtotal,
      shipping,
      total: grandTotal,
      method: shippingMethodTitle,
      subscribeEmail: subscribeEmail
    };

    // Check Flutterwave Gateway Configuration
    let flwConfig = { publicKey: '', paymentOptions: 'card, banktransfer' };
    try {
      const cfgRes = await fetch('/api/payment-config');
      flwConfig = await cfgRes.json();
    } catch (e) {
      console.warn('Config fetch note:', e.message);
    }

    // If Flutterwave SDK is loaded and public key is configured, trigger modal
    if (window.FlutterwaveCheckout && flwConfig.publicKey) {
      FlutterwaveCheckout({
        public_key: flwConfig.publicKey,
        tx_ref: 'GT-' + Date.now(),
        amount: grandTotal,
        currency: 'NGN',
        payment_options: 'card, banktransfer', // STRICTLY Debit Card & Direct Bank Transfer Only!
        customer: {
          email: email,
          phone_number: phone,
          name: `${firstName} ${lastName}`,
        },
        customizations: {
          title: 'GINGERTRENDZ Atelier',
          description: 'Payment for luxury garments',
          logo: window.location.origin + '/assets/images/logo.jpg',
        },
        callback: async (paymentResponse) => {
          // Payment completed through Flutterwave Card / Bank Transfer
          orderPayload.paymentDetails = paymentResponse;
          orderPayload.method = `${shippingMethodTitle} (Flutterwave: ${paymentResponse.payment_type || 'Card/Bank'})`;
          await this.completeOrderSubmission(orderPayload);
        },
        onclose: () => {
          this.showToast('Payment modal closed.');
        }
      });
      return;
    }

    // Fallback/Testing simulation if key not configured
    await this.completeOrderSubmission(orderPayload);
  },

  async completeOrderSubmission(orderPayload) {
    if (this.elements.paymentModal) {
      this.elements.paymentModal.classList.add('active');
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      setTimeout(() => {
        if (this.elements.paymentModal) {
          this.elements.paymentModal.classList.remove('active');
        }

        if (data.success) {
          this.cart = [];
          this.saveCartToStorage();
          this.showReceipt(data.order);
          this.loadProducts(); // Refresh inventory counts
          this.showToast('✦ Order confirmed! Email receipt & drop alerts active.');
        } else {
          alert(data.message || 'Error processing order.');
        }
      }, 1200);

    } catch (err) {
      console.error('Order creation error:', err);
      if (this.elements.paymentModal) {
        this.elements.paymentModal.classList.remove('active');
      }
      alert('Unable to connect to order server. Please verify your connection.');
    }
  },

  showReceipt(order) {
    this.elements.receiptRef.textContent = order.id;
    this.elements.receiptDate.textContent = new Date(order.created_at).toLocaleString();
    this.elements.receiptMethod.textContent = order.method || 'Standard Courier Delivery';
    this.elements.receiptCustomer.textContent = `${order.customer.firstName} ${order.customer.lastName} (${order.customer.phone})`;
    this.elements.receiptAddress.textContent = `${order.customer.address}, ${order.customer.city}, ${order.customer.state}`;
    this.elements.receiptSubtotal.textContent = '₦' + Number(order.subtotal).toLocaleString();
    this.elements.receiptShipping.textContent = order.shipping === 0 ? 'Complimentary' : '₦' + Number(order.shipping).toLocaleString();
    this.elements.receiptTotal.textContent = '₦' + Number(order.total).toLocaleString();

    this.showView('success');
  },

  // ADMIN AUTHENTICATION
  async handleAdminLogin() {
    const email = this.elements.adminEmail.value.trim();
    const password = this.elements.adminPassword.value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('gt_admin_token', data.token);
        this.adminLoggedIn = true;
        if (this.elements.loginError) this.elements.loginError.classList.remove('active');
        this.showToast('Authenticated as Atelier Director');
        this.showView('adminDashboard');
        if (window.AdminApp) {
          window.AdminApp.loadDashboard();
        }
      } else {
        if (this.elements.loginError) {
          this.elements.loginError.textContent = data.message || 'Incorrect credentials.';
          this.elements.loginError.classList.add('active');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (this.elements.loginError) {
        this.elements.loginError.textContent = 'Server connection issue. Please retry.';
        this.elements.loginError.classList.add('active');
      }
    }
  },

  // Toast Notification
  showToast(message) {
    const hub = this.elements.toastHub;
    if (!hub) return;

    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ginger)" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;

    hub.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.StoreApp = StoreApp;
  StoreApp.init();
});
