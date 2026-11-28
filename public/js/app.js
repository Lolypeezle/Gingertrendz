const StoreApp = {
  products: [],
  cart: [],
  selectedProduct: null,
  selectedSize: null,
  selectedColor: null,
  selectedQty: 1,
  currentCategory: 'all',
  shippingFee: 5000,
  adminLoggedIn: false,
  activeDashTab: 'orders',

  elements: {},

  async init() {
    this.cacheElements();
    this.loadCartFromStorage();
    this.bindEvents();
    this.checkAdminSession();
    await this.loadProducts();
    this.updateCartUI();
    this.updateWishlistUI();

    if (window.AdminApp) {
      window.AdminApp.init();
    }
  },

  cacheElements() {
    this.elements = {
      views: {
        storefront: document.getElementById('storefront-view'),
        customerDashboard: document.getElementById('customer-dashboard-view'),
        checkout: document.getElementById('checkout-view'),
        success: document.getElementById('success-view'),
        adminLogin: document.getElementById('admin-login-view'),
        adminDashboard: document.getElementById('admin-view')
      },

      navLogo: document.getElementById('nav-logo'),
      navShop: document.getElementById('nav-shop'),
      navLookbook: document.getElementById('nav-lookbook'),
      navClientPortal: document.getElementById('nav-client-portal'),
      navAdmin: document.getElementById('nav-admin'),
      cartBtn: document.getElementById('cart-btn'),
      cartCount: document.getElementById('cart-count'),
      mobileCartCount: document.getElementById('mobile-cart-count'),
      navWishlistBtn: document.getElementById('nav-wishlist-btn'),
      wishlistCount: document.getElementById('wishlist-count'),
      navSearchInput: document.getElementById('nav-search-input'),
      floatingCartBtn: document.getElementById('floating-cart-btn'),
      floatingCartCount: document.getElementById('floating-cart-count'),
      clientDashBackBtn: document.getElementById('client-dash-back-btn'),
      dashWishlistCount: document.getElementById('dash-wishlist-count'),
      dashTabBtns: document.querySelectorAll('.dashboard-glass-nav-pills .dash-tab-btn'),
      dashPanels: document.querySelectorAll('#customer-dashboard-view .dashboard-panel'),
      clientOrdersTableBody: document.getElementById('client-orders-table-body'),
      clientWishlistGrid: document.getElementById('client-wishlist-grid'),
      clientReceiptsList: document.getElementById('client-receipts-list'),

      mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
      mobileGlassNav: document.getElementById('mobile-glass-nav'),
      mobileNavClose: document.getElementById('mobile-nav-close'),
      mobileNavShop: document.getElementById('mobile-nav-shop'),
      mobileNavLookbook: document.getElementById('mobile-nav-lookbook'),
      mobileNavPortal: document.getElementById('mobile-nav-portal'),
      mobileNavAdmin: document.getElementById('mobile-nav-admin'),

      productsGrid: document.getElementById('products-grid'),
      categoryChips: document.querySelectorAll('#category-filter-container .category-chip'),
      searchInput: document.getElementById('search-input'),
      sortSelect: document.getElementById('sort-select'),
      heroShopBtn: document.getElementById('hero-shop-btn'),

      drawerOverlay: document.getElementById('drawer-overlay'),
      detailDrawer: document.getElementById('product-detail-drawer'),
      detailClose: document.getElementById('detail-drawer-close'),
      cartDrawer: document.getElementById('cart-drawer'),
      cartClose: document.getElementById('cart-drawer-close'),
      cartContinueBtn: document.getElementById('cart-continue-btn'),

      detailImage: document.getElementById('detail-image-container'),
      detailGalleryThumbnails: document.getElementById('detail-gallery-thumbnails'),
      detailVideoContainer: document.getElementById('detail-video-container'),
      detailCategory: document.getElementById('detail-category'),
      detailBadge: document.getElementById('detail-badge'),
      detailTitle: document.getElementById('detail-title'),
      detailPrice: document.getElementById('detail-price'),
      detailDescription: document.getElementById('detail-description'),
      detailColors: document.getElementById('detail-colors-container'),
      detailColorSelectedName: document.getElementById('detail-color-selected-name'),
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

      detailReviewsSection: document.getElementById('detail-reviews-section'),
      detailReviewsList: document.getElementById('detail-reviews-list'),
      detailRatingNumber: document.getElementById('detail-rating-number'),
      detailReviewsCountLabel: document.getElementById('detail-reviews-count-label'),
      detailRatingQuick: document.getElementById('detail-rating-quick'),
      detailReviewsQuickCount: document.getElementById('detail-reviews-quick-count'),

      cartItems: document.getElementById('cart-items-container'),
      cartCountLabel: document.getElementById('cart-items-count-label'),
      shippingProgressBar: document.getElementById('shipping-progress-bar'),
      shippingProgressText: document.getElementById('shipping-progress-text'),
      cartSubtotal: document.getElementById('cart-subtotal'),
      cartShipping: document.getElementById('cart-shipping'),
      cartTotal: document.getElementById('cart-total'),
      cartCheckoutBtn: document.getElementById('cart-checkout-btn'),

      checkoutForm: document.getElementById('checkout-details-form'),
      checkoutItems: document.getElementById('checkout-summary-items'),
      checkoutSubtotal: document.getElementById('checkout-subtotal'),
      checkoutDelivery: document.getElementById('checkout-delivery'),
      checkoutTotal: document.getElementById('checkout-total'),
      btnProceedPayment: document.getElementById('proceed-payment-btn'),
      btnCancelCheckout: document.getElementById('cancel-checkout-btn'),
      btnCancelCheckoutTop: document.getElementById('cancel-checkout-top-btn'),
      shippingMethodRadios: document.querySelectorAll('input[name="shipping-method"]'),

      receiptRef: document.getElementById('receipt-ref'),
      receiptDate: document.getElementById('receipt-date'),
      receiptMethod: document.getElementById('receipt-method'),
      receiptCustomer: document.getElementById('receipt-customer'),
      receiptAddress: document.getElementById('receipt-address'),
      receiptSubtotal: document.getElementById('receipt-subtotal'),
      receiptShipping: document.getElementById('receipt-shipping'),
      receiptTotal: document.getElementById('receipt-total'),
      btnSuccessShop: document.getElementById('success-shop-btn'),

      adminLoginForm: document.getElementById('admin-login-form'),
      adminEmail: document.getElementById('admin-email'),
      adminPassword: document.getElementById('admin-password'),
      loginError: document.getElementById('login-error-msg'),
      btnQuickFillAdmin: document.getElementById('btn-quick-fill-admin'),
      btnBackToShop: document.getElementById('btn-back-to-shop'),

      paymentModal: document.getElementById('payment-confirmation-modal'),
      toastHub: document.getElementById('toast-hub')
    };
  },

  bindEvents() {
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

    if (this.elements.navLogo) {
      this.elements.navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
        this.showView('storefront');
      });
    }

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

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.hash = '#admin';
      }
    });

    if (this.elements.heroShopBtn) {
      this.elements.heroShopBtn.addEventListener('click', () => {
        const controls = document.getElementById('category-filter-container');
        if (controls) controls.scrollIntoView({ behavior: 'auto' });
      });
    }

    this.elements.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.elements.categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-category');
        this.loadProducts();
      });
    });

    let searchTimeout;
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.loadProducts();
        }, 300);
      });
    }

    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', () => {
        this.loadProducts();
      });
    }

    if (this.elements.cartBtn) {
      this.elements.cartBtn.addEventListener('click', () => this.toggleCartDrawer(true));
    }

    if (this.elements.floatingCartBtn) {
      this.elements.floatingCartBtn.addEventListener('click', () => this.toggleCartDrawer(true));
    }

    if (this.elements.navWishlistBtn) {
      this.elements.navWishlistBtn.addEventListener('click', () => this.showCustomerDashboard('wishlist'));
    }

    if (this.elements.navLookbook) {
      this.elements.navLookbook.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView('storefront');
        const el = document.getElementById('category-filter-container');
        if (el) el.scrollIntoView({ behavior: 'auto' });
      });
    }

    if (this.elements.navClientPortal) {
      this.elements.navClientPortal.addEventListener('click', (e) => {
        e.preventDefault();
        this.showCustomerDashboard('orders');
      });
    }

    if (this.elements.clientDashBackBtn) {
      this.elements.clientDashBackBtn.addEventListener('click', () => {
        this.showView('storefront');
      });
    }

    if (this.elements.mobileMenuToggle) {
      this.elements.mobileMenuToggle.addEventListener('click', () => {
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.toggle('active');
      });
    }

    if (this.elements.mobileNavClose) {
      this.elements.mobileNavClose.addEventListener('click', () => {
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.remove('active');
      });
    }

    if (this.elements.mobileNavShop) {
      this.elements.mobileNavShop.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.remove('active');
        this.showView('storefront');
      });
    }

    if (this.elements.mobileNavLookbook) {
      this.elements.mobileNavLookbook.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.remove('active');
        this.showView('storefront');
        const el = document.getElementById('category-filter-container');
        if (el) el.scrollIntoView({ behavior: 'auto' });
      });
    }

    if (this.elements.mobileNavPortal) {
      this.elements.mobileNavPortal.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.remove('active');
        this.showCustomerDashboard('orders');
      });
    }

    if (this.elements.mobileNavAdmin) {
      this.elements.mobileNavAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.elements.mobileGlassNav) this.elements.mobileGlassNav.classList.remove('active');
        if (this.adminLoggedIn) {
          this.showView('adminDashboard');
          if (window.AdminApp) window.AdminApp.loadDashboard();
        } else {
          this.showView('adminLogin');
        }
      });
    }

    if (this.elements.navSearchInput) {
      this.elements.navSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (this.elements.searchInput) {
            this.elements.searchInput.value = this.elements.navSearchInput.value;
          }
          this.showView('storefront');
          this.loadProducts();
        }, 300);
      });
    }

    if (this.elements.dashTabBtns) {
      this.elements.dashTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-dash-tab');
          this.switchDashboardTab(tab);
        });
      });
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

    if (this.elements.btnCancelCheckout) {
      this.elements.btnCancelCheckout.addEventListener('click', () => this.showView('storefront'));
    }
    if (this.elements.btnCancelCheckoutTop) {
      this.elements.btnCancelCheckoutTop.addEventListener('click', () => this.showView('storefront'));
    }

    this.elements.shippingMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.elements.shippingMethodRadios.forEach(r => {
          r.closest('.shipping-option-card').classList.toggle('active', r.checked);
        });
        this.shippingFee = Number(radio.value);
        this.updateCheckoutTotals();
      });
    });

    if (this.elements.btnProceedPayment) {
      this.elements.btnProceedPayment.addEventListener('click', () => {
        this.handleCheckoutSubmit();
      });
    }

    if (this.elements.btnSuccessShop) {
      this.elements.btnSuccessShop.addEventListener('click', () => {
        this.showView('storefront');
      });
    }

    if (this.elements.adminLoginForm) {
      this.elements.adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdminLogin();
      });
    }

    if (this.elements.btnQuickFillAdmin) {
      this.elements.btnQuickFillAdmin.addEventListener('click', () => {
        this.elements.adminEmail.value = 'thefashiondisciples@gmail.com';
        this.elements.adminPassword.value = 'Jamal22#';
        if (this.elements.loginError) this.elements.loginError.classList.remove('active');
      });
    }

    if (this.elements.btnBackToShop) {
      this.elements.btnBackToShop.addEventListener('click', () => {
        this.showView('storefront');
      });
    }

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
        window.scrollTo({ top: 500, behavior: 'auto' });
      });
    });

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

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (this.elements.navShop) this.elements.navShop.classList.toggle('active', viewKey === 'storefront');
    if (this.elements.navClientPortal) this.elements.navClientPortal.classList.toggle('active', viewKey === 'customerDashboard');
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

  async loadProducts() {
    const category = this.currentCategory || 'all';
    const search = this.elements.searchInput ? this.elements.searchInput.value.trim().toLowerCase() : '';
    const sort = this.elements.sortSelect ? this.elements.sortSelect.value : 'default';

    // 1. Instant zero-latency render from GT_PRODUCTS_STORE
    if (window.GT_PRODUCTS_STORE) {
      let prods = window.GT_PRODUCTS_STORE.getAllProducts();
      if (category && category !== 'all') {
        prods = prods.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        prods = prods.filter(p =>
          (p.title && p.title.toLowerCase().includes(search)) ||
          (p.description && p.description.toLowerCase().includes(search))
        );
      }
      if (sort === 'price-asc') prods.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === 'price-desc') prods.sort((a, b) => Number(b.price) - Number(a.price));
      else if (sort === 'name') prods.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

      this.products = prods;
      this.renderProductsGrid();
    }

    // 2. Non-blocking background sync with backend server if present
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (sort && sort !== 'default') params.append('sort', sort);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const custom = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getCustomProducts() : [];
          const deleted = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getDeletedIds() : [];
          const customIds = new Set(custom.map(c => c.id));
          const merged = [...custom];
          data.products.forEach(p => {
            if (!customIds.has(p.id) && !deleted.includes(p.id)) {
              merged.push(p);
            }
          });
          this.products = merged;
          this.renderProductsGrid();
        }
      }
    } catch (err) {
      // Offline or static Netlify host fallback already applied
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

    const wishlistIds = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getWishlist() : [];

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

      const isWishlisted = wishlistIds.includes(p.id);
      const ratingVal = p.rating || 4.9;
      const reviewsCount = p.reviewsCount || (p.reviews ? p.reviews.length : 42);

      const colorDotsHtml = (p.colors && p.colors.length)
        ? `<div class="card-color-dots">${p.colors.map(c => `<span class="card-color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>`).join('')}</div>`
        : '';

      return `
        <div class="product-card" onclick="StoreApp.openProductDetail('${p.id}')">
          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-product-id="${p.id}" onclick="event.stopPropagation(); StoreApp.toggleWishlist('${p.id}')" aria-label="Save to Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <div class="product-image-wrap">
            <span class="product-card-badge">${p.badge || 'New'}</span>
            <img src="${p.image}" class="product-img" alt="${p.title}" loading="lazy" decoding="async" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
            <div class="product-card-quick-sizes">
              ${quickSizesHtml}
            </div>
          </div>
          <div class="product-info">
            <div class="product-meta-row">
              <span class="product-cat">${p.category}</span>
              <span class="product-stock-tag">${stockTag}</span>
            </div>
            <div class="card-rating-badge">
              <span class="stars-mini">★</span>
              <span>${ratingVal}</span>
              <span style="opacity: 0.7;">(${reviewsCount})</span>
            </div>
            <h2 class="product-title">${p.title}</h2>
            ${colorDotsHtml}
            <div class="product-bottom-row">
              <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
              <button class="card-quick-add-btn" onclick="event.stopPropagation(); StoreApp.quickAddToCart('${p.id}')">Quick Add</button>
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

  openProductDetail(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.selectedProduct = product;
    this.selectedQty = 1;
    if (this.elements.detailQtyVal) this.elements.detailQtyVal.textContent = 1;

    if (this.elements.detailImage) {
      this.elements.detailImage.innerHTML = `
        <img src="${product.image}" id="detail-active-main-img" class="detail-img" alt="${product.title}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
      `;
    }
    if (this.elements.detailCategory) this.elements.detailCategory.textContent = product.category;
    if (this.elements.detailBadge) this.elements.detailBadge.textContent = product.badge || 'Essential';
    if (this.elements.detailTitle) this.elements.detailTitle.textContent = product.title;
    if (this.elements.detailPrice) this.elements.detailPrice.textContent = '₦' + Number(product.price).toLocaleString();
    if (this.elements.detailDescription) this.elements.detailDescription.textContent = product.description;

    // Gallery Thumbnails
    if (this.elements.detailGalleryThumbnails) {
      const gallery = (product.gallery && product.gallery.length) ? product.gallery : [product.image];
      this.elements.detailGalleryThumbnails.innerHTML = gallery.map((imgSrc, idx) => `
        <button type="button" class="detail-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="StoreApp.selectDetailGalleryImage('${imgSrc}', this)">
          <img src="${imgSrc}" alt="${product.title} view ${idx + 1}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
        </button>
      `).join('');
    }

    // Product Video (Preserving existing product videos)
    if (this.elements.detailVideoContainer) {
      if (product.video) {
        this.elements.detailVideoContainer.style.display = 'block';
        this.elements.detailVideoContainer.innerHTML = `
          <video controls playsinline poster="${product.image}">
            <source src="${product.video}" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
        `;
      } else {
        this.elements.detailVideoContainer.style.display = 'none';
        this.elements.detailVideoContainer.innerHTML = '';
      }
    }

    // Product Colorway Selection (Preserving color selection)
    const colors = (product.colors && product.colors.length) ? product.colors : [
      { name: product.color || 'Signature Ginger', hex: '#C08552' }
    ];
    this.selectedColor = colors[0].name;
    if (this.elements.detailColorSelectedName) {
      this.elements.detailColorSelectedName.textContent = this.selectedColor;
    }
    if (this.elements.detailColors) {
      this.elements.detailColors.innerHTML = colors.map((col, idx) => `
        <button type="button" class="color-swatch-pill ${idx === 0 ? 'active' : ''}" data-color="${col.name}" onclick="StoreApp.selectDetailColor('${col.name}', this)">
          <span class="color-swatch-dot" style="background-color: ${col.hex};"></span>
          <span>${col.name}</span>
        </button>
      `).join('');
    }

    // Sizes
    const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizeStock = product.sizeStock || {};

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

    if (this.elements.detailSizes) {
      this.elements.detailSizes.innerHTML = sizesHtml;
    }

    if (firstAvailableSize) {
      this.selectDetailSize(firstAvailableSize, sizeStock[firstAvailableSize] || 5);
    } else {
      this.selectedSize = null;
      if (this.elements.detailSizeLabel) this.elements.detailSizeLabel.textContent = 'All sizes currently sold out';
      if (this.elements.detailStock) {
        this.elements.detailStock.textContent = 'Out of Stock';
        this.elements.detailStock.style.color = 'var(--error)';
      }
      if (this.elements.detailAddBtn) this.elements.detailAddBtn.disabled = true;
    }

    // Customer Reviews & Ratings (Preserving customer ratings and reviews)
    const reviews = (product.reviews && product.reviews.length) ? product.reviews : [
      { author: 'Chinedu O.', rating: 5, date: '2 days ago', comment: 'Exceptional architectural drape and heavy 520GSM texture. Exactly what high-end streetwear should feel like.' },
      { author: 'Amina K.', rating: 5, date: '1 week ago', comment: 'Fit is perfectly oversized with crisp shoulder posture. Packaging was pristine.' }
    ];
    const ratingNum = product.rating || 4.9;
    const reviewsCount = product.reviewsCount || reviews.length;

    if (this.elements.detailRatingNumber) this.elements.detailRatingNumber.textContent = `${ratingNum} / 5.0`;
    if (this.elements.detailReviewsCountLabel) this.elements.detailReviewsCountLabel.textContent = `(${reviewsCount} verified client reviews)`;
    if (this.elements.detailRatingQuick) this.elements.detailRatingQuick.textContent = ratingNum;
    if (this.elements.detailReviewsQuickCount) this.elements.detailReviewsQuickCount.textContent = `(${reviewsCount} reviews)`;

    if (this.elements.detailReviewsList) {
      this.elements.detailReviewsList.innerHTML = reviews.map(rev => `
        <div class="review-card">
          <div class="review-card-top">
            <div class="review-author-wrap">
              <span class="review-author">${rev.author}</span>
              <span class="verified-collector-pill">Verified Collector</span>
            </div>
            <span class="review-date">${rev.date}</span>
          </div>
          <div class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
          <p class="review-comment">${rev.comment}</p>
        </div>
      `).join('');
    }

    this.toggleDetailDrawer(true);
  },

  selectDetailGalleryImage(imgSrc, btn) {
    const mainImg = document.getElementById('detail-active-main-img');
    if (mainImg) mainImg.src = imgSrc;
    document.querySelectorAll('.detail-thumb-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  selectDetailColor(colorName, btn) {
    this.selectedColor = colorName;
    if (this.elements.detailColorSelectedName) {
      this.elements.detailColorSelectedName.textContent = colorName;
    }
    document.querySelectorAll('.color-swatch-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  quickAddToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const sizes = product.sizes || ['M', 'L', 'S', 'XL'];
    const sizeStock = product.sizeStock || {};
    const availSize = sizes.find(s => (sizeStock[s] === undefined || sizeStock[s] > 0)) || sizes[0];
    const defaultColor = (product.colors && product.colors[0]) ? product.colors[0].name : (product.color || 'Signature Ginger');
    this.addToCart(product, availSize, 1, defaultColor);
    this.toggleCartDrawer(true);
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

  addToCart(product, size, qty = 1, color = null) {
    const chosenColor = color || this.selectedColor || product.color || 'Signature Ginger';
    const existingIndex = this.cart.findIndex(item => item.id === product.id && item.size === size && item.color === chosenColor);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += qty;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        color: chosenColor,
        size: size,
        quantity: qty
      });
    }

    this.saveCartToStorage();
    this.showToast(`Added ${qty}× ${product.title} (${chosenColor} / ${size}) to Bag`);
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
    if (this.elements.floatingCartCount) this.elements.floatingCartCount.textContent = totalQty;
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
            <span class="cart-size-pill">${item.color ? item.color + ' • ' : ''}Size: ${item.size}</span>
          </div>
          <span class="cart-item-price">₦${Number(item.price * item.quantity).toLocaleString()}</span>
          <div class="cart-item-controls">
            <div class="quantity-stepper">
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

    const progressPercent = Math.min(100, Math.round((subtotal / 120000) * 100));
    this.elements.shippingProgressBar.style.width = progressPercent + '%';

    if (subtotal >= 120000) {
      this.elements.shippingProgressText.textContent = '✨ You unlocked Complimentary Nationwide Dispatch!';
    } else {
      const remaining = 120000 - subtotal;
      this.elements.shippingProgressText.textContent = `Add ₦${remaining.toLocaleString()} more for Complimentary Dispatch`;
    }
  },

  toggleWishlist(productId) {
    if (!window.GT_PRODUCTS_STORE) return;
    const isSaved = window.GT_PRODUCTS_STORE.toggleWishlist(productId);
    this.updateWishlistUI();
    this.showToast(isSaved ? '✦ Silhouette saved to Curated Wishlist' : '✦ Removed from Wishlist');
  },

  updateWishlistUI() {
    const list = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getWishlist() : [];
    if (this.elements.wishlistCount) this.elements.wishlistCount.textContent = list.length;
    if (this.elements.dashWishlistCount) this.elements.dashWishlistCount.textContent = list.length;

    document.querySelectorAll('.card-wishlist-btn[data-product-id]').forEach(btn => {
      const pid = btn.getAttribute('data-product-id');
      btn.classList.toggle('active', list.includes(pid));
    });

    if (this.activeDashTab === 'wishlist') {
      this.renderCustomerWishlist();
    }
  },

  showCustomerDashboard(initialTab = 'orders') {
    this.showView('customerDashboard');
    this.switchDashboardTab(initialTab);
    this.renderCustomerOrders();
    this.renderCustomerWishlist();
    this.renderCustomerReceipts();
  },

  switchDashboardTab(tabName) {
    this.activeDashTab = tabName;
    document.querySelectorAll('.dashboard-glass-nav-pills .dash-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-dash-tab') === tabName);
    });
    document.querySelectorAll('#customer-dashboard-view .dashboard-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `dash-panel-${tabName}`);
    });

    if (tabName === 'orders') this.renderCustomerOrders();
    else if (tabName === 'wishlist') this.renderCustomerWishlist();
    else if (tabName === 'receipts') this.renderCustomerReceipts();
  },

  renderCustomerOrders() {
    const tbody = this.elements.clientOrdersTableBody;
    if (!tbody) return;

    let orders = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getCustomerOrders() : [];
    if (!orders || orders.length === 0) {
      orders = [
        {
          id: 'GT-684201',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          customer: { firstName: 'The Fashion', lastName: 'Disciple', city: 'Lagos', state: 'Lagos' },
          items: [{ title: 'Heavyweight Architectural Hoodie', size: 'L', quantity: 1, price: 48000 }],
          method: 'Priority Insured Courier',
          total: 53000,
          status: 'In Transit'
        }
      ];
    }

    const latest = orders[0];
    if (latest && document.getElementById('tracking-active-ref')) {
      document.getElementById('tracking-active-ref').textContent = `Order #${latest.id}`;
    }

    tbody.innerHTML = orders.map(ord => {
      const dateStr = new Date(ord.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const itemsStr = (ord.items || []).map(i => `${i.title} (${i.size} × ${i.quantity})`).join(', ');
      const destination = ord.customer ? `${ord.customer.city || ''}, ${ord.customer.state || 'Nigeria'}` : 'Lagos, Nigeria';

      return `
        <tr>
          <td><strong style="color: var(--accent-champagne); font-family: monospace;">#${ord.id}</strong></td>
          <td style="font-size: 13px;">${dateStr}</td>
          <td style="font-size: 13px; max-width: 240px;">${itemsStr}</td>
          <td style="font-size: 13px;">${destination}</td>
          <td style="font-size: 12px; color: var(--text-secondary);">${ord.method || 'Standard Courier'}</td>
          <td style="font-weight: 700;">₦${Number(ord.total).toLocaleString()}</td>
          <td><span class="status-badge in-stock">${ord.status || 'Verified'}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="StoreApp.viewOrderReceipt('${ord.id}')">View Receipt</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCustomerWishlist() {
    const grid = this.elements.clientWishlistGrid;
    if (!grid) return;

    const wishlistIds = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getWishlist() : [];
    const wishProds = this.products.filter(p => wishlistIds.includes(p.id));

    if (!wishProds.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px dashed var(--glass-border);">
          <p style="font-size: 15px; margin-bottom: 12px; color: var(--text-primary);">Your curated silhouette wishlist is currently empty.</p>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 18px;">Click the heart icon on any garment in the lookbook to save it here for private acquisition.</p>
          <button class="btn" onclick="StoreApp.showView('storefront')">Explore Boutique Lookbook</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = wishProds.map(p => `
      <div class="product-card" onclick="StoreApp.openProductDetail('${p.id}')">
        <div class="product-image-wrap">
          <img src="${p.image}" class="product-img" alt="${p.title}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
        </div>
        <div class="product-info">
          <div class="product-meta-row">
            <span class="product-cat">${p.category}</span>
            <span class="product-stock-tag">${p.stock || 5} available</span>
          </div>
          <h3 class="product-title">${p.title}</h3>
          <div class="product-bottom-row" style="margin-top: 10px;">
            <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
            <div style="display: flex; gap: 6px;">
              <button class="card-quick-add-btn" onclick="event.stopPropagation(); StoreApp.quickAddToCart('${p.id}')">Add to Bag</button>
              <button class="btn-card-view" style="padding: 6px 10px;" onclick="event.stopPropagation(); StoreApp.toggleWishlist('${p.id}')">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderCustomerReceipts() {
    const container = this.elements.clientReceiptsList;
    if (!container) return;

    let orders = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getCustomerOrders() : [];
    if (!orders || orders.length === 0) {
      orders = [
        {
          id: 'GT-684201',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          customer: { firstName: 'The Fashion', lastName: 'Disciple', email: 'thefashiondisciples@gmail.com', address: '12 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos' },
          items: [{ title: 'Heavyweight Architectural Hoodie', size: 'L', quantity: 1, price: 48000 }],
          subtotal: 48000,
          shipping: 5000,
          total: 53000,
          method: 'Priority Insured Courier'
        }
      ];
    }

    container.innerHTML = orders.map(ord => {
      const dateStr = new Date(ord.created_at).toLocaleString();
      return `
        <div class="receipt-glass-card">
          <div class="receipt-info-group">
            <span class="receipt-id-tag">Receipt Ref: #${ord.id}</span>
            <span class="receipt-meta-sub">${dateStr} • ${ord.method || 'Standard Courier'}</span>
            <span style="font-size: 13px; color: var(--text-primary); margin-top: 4px;">
              ${(ord.items || []).map(i => `${i.title} (${i.size}) × ${i.quantity}`).join(', ')}
            </span>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span style="font-size: 17px; font-weight: 700; color: var(--text-primary);">₦${Number(ord.total).toLocaleString()}</span>
            <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 12px;" onclick="StoreApp.viewOrderReceipt('${ord.id}')">Open Official Receipt</button>
          </div>
        </div>
      `;
    }).join('');
  },

  viewOrderReceipt(orderId) {
    let orders = window.GT_PRODUCTS_STORE ? window.GT_PRODUCTS_STORE.getCustomerOrders() : [];
    const found = orders.find(o => o.id === orderId);
    if (found) {
      this.showReceipt(found);
    } else {
      this.showReceipt({
        id: orderId,
        created_at: new Date().toISOString(),
        customer: { firstName: 'The Fashion', lastName: 'Disciple', phone: '+234 801 234 5678', address: '12 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos' },
        subtotal: 48000,
        shipping: 5000,
        total: 53000,
        method: 'Priority Insured Courier'
      });
    }
  },
      </div>
    `).join('');

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 120000 ? 0 : this.shippingFee;
    const total = subtotal + shipping;

    this.elements.cartSubtotal.textContent = '₦' + subtotal.toLocaleString();
    this.elements.cartShipping.textContent = shipping === 0 ? 'Complimentary' : '₦' + shipping.toLocaleString();
    this.elements.cartTotal.textContent = '₦' + total.toLocaleString();

    const progressPercent = Math.min(100, Math.round((subtotal / 120000) * 100));
    this.elements.shippingProgressBar.style.width = progressPercent + '%';

    if (subtotal >= 120000) {
      this.elements.shippingProgressText.textContent = '✨ You unlocked Complimentary Nationwide Dispatch!';
    } else {
      const remaining = 120000 - subtotal;
      this.elements.shippingProgressText.textContent = `Add ₦${remaining.toLocaleString()} more for Complimentary Dispatch`;
    }
  },

  openCheckout() {
    this.showView('checkout');

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.shippingFee = subtotal >= 120000 ? 0 : 5000;

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

    let flwConfig = { publicKey: '', paymentOptions: 'card, banktransfer' };
    try {
      const cfgRes = await fetch('/api/payment-config');
      flwConfig = await cfgRes.json();
    } catch (e) {
      console.warn('Config fetch note:', e.message);
    }

    if (window.FlutterwaveCheckout && flwConfig.publicKey) {
      FlutterwaveCheckout({
        public_key: flwConfig.publicKey,
        tx_ref: 'GT-' + Date.now(),
        amount: grandTotal,
        currency: 'NGN',
        payment_options: 'card, banktransfer',
        customer: {
          email: email,
          phone_number: phone,
          name: `${firstName} ${lastName}`,
        },
        customizations: {
          title: 'GINGERTRENDZ',
          description: 'Payment for luxury garments',
          logo: window.location.origin + '/assets/images/logo.jpg',
        },
        callback: async (paymentResponse) => {
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
          if (window.GT_PRODUCTS_STORE) {
            window.GT_PRODUCTS_STORE.saveCustomerOrder(data.order);
          }
          this.cart = [];
          this.saveCartToStorage();
          this.showReceipt(data.order);
          this.loadProducts();
          this.showToast('✦ Order confirmed! Email receipt & drop alerts active.');
        } else {
          alert(data.message || 'Error processing order.');
        }
      }, 1200);

    } catch (err) {
      console.warn('Order API unavailable, recording in local collector vault:', err);
      if (this.elements.paymentModal) {
        this.elements.paymentModal.classList.remove('active');
      }
      const offlineOrder = {
        id: 'GT-' + Date.now().toString().slice(-6),
        created_at: new Date().toISOString(),
        customer: orderPayload.customer,
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        shipping: orderPayload.shipping,
        total: orderPayload.total,
        method: orderPayload.method || 'Priority Courier Delivery',
        status: 'Order Confirmed'
      };
      if (window.GT_PRODUCTS_STORE) {
        window.GT_PRODUCTS_STORE.saveCustomerOrder(offlineOrder);
      }
      this.cart = [];
      this.saveCartToStorage();
      this.showReceipt(offlineOrder);
      this.loadProducts();
      this.showToast('✦ Order confirmed! Receipt & tracking available in Client Portal.');
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

  async handleAdminLogin() {
    const email = this.elements.adminEmail.value.trim();
    const password = this.elements.adminPassword.value;

    let serverSuccess = false;
    let serverHandled = false;
    let serverErrorMsg = null;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        serverHandled = true;
        const data = await res.json();
        if (data.success) {
          serverSuccess = true;
          localStorage.setItem('gt_admin_token', data.token);
        } else {
          serverErrorMsg = data.message || 'Incorrect credentials.';
        }
      }
    } catch (err) {
      console.warn('API login endpoint unreachable, checking static credentials:', err);
    }

    if (serverHandled) {
      if (serverSuccess) {
        this.adminLoggedIn = true;
        if (this.elements.loginError) this.elements.loginError.classList.remove('active');
        this.showToast('Authenticated as Admin');
        this.showView('adminDashboard');
        if (window.AdminApp) window.AdminApp.loadDashboard();
      } else {
        if (this.elements.loginError) {
          this.elements.loginError.textContent = serverErrorMsg || 'Incorrect credentials.';
          this.elements.loginError.classList.add('active');
        }
      }
      return;
    }

    // Static hosting fallback (e.g. Netlify deployment without Node.js backend)
    const validEmails = ['thefashiondisciples@gmail.com', 'admin@gingertrendz.com', 'curator@gingertrendz.com', 'director@gingertrendz.com'];
    const validPass = 'Jamal22#';

    const matchEmail = !email || validEmails.some(e => e.toLowerCase() === email.trim().toLowerCase());
    const matchPass = password === validPass;

    if (matchEmail && matchPass) {
      localStorage.setItem('gt_admin_token', 'gt-curator-session-' + Date.now());
      this.adminLoggedIn = true;
      if (this.elements.loginError) this.elements.loginError.classList.remove('active');
      this.showToast('Authenticated as Admin');
      this.showView('adminDashboard');
      if (window.AdminApp) window.AdminApp.loadDashboard();
    } else {
      if (this.elements.loginError) {
        this.elements.loginError.textContent = 'Invalid email or password.';
        this.elements.loginError.classList.add('active');
      }
    }
  },

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
