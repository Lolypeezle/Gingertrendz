/**
 * GINGERTRENDZ - Admin Portal Management Engine
 * Communicates with Node.js REST API
 */

const AdminApp = {
  activePanel: 'admin-overview',
  stats: {},
  products: [],
  orders: [],
  subscribers: [],
  emailLogs: [],

  init() {
    this.bindEvents();
    this.setupImagePreview();
  },

  bindEvents() {
    // Admin navigation items
    const navItems = document.querySelectorAll('.admin-nav-item[data-admin-panel]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const panelId = item.getAttribute('data-admin-panel');
        this.switchPanel(panelId);
      });
    });

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Reset default catalog button
    const resetBtn = document.getElementById('admin-reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Restore the Gingertrendz default catalog sample data?')) {
          if (confirm('Restore the default catalog sample data?')) {
            this.resetDefaultCatalog();
          }
        });
    }

    // Add Product button
    const addProductBtn = document.getElementById('admin-add-product-btn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => {
        this.openProductModal();
      });
    }

    // Modal Close buttons
    const modalClose = document.getElementById('admin-modal-close');
    const modalCancel = document.getElementById('admin-modal-cancel');
    const modalOverlay = document.getElementById('admin-product-modal-overlay');

    if (modalClose) modalClose.addEventListener('click', () => this.closeProductModal());
    if (modalCancel) modalCancel.addEventListener('click', () => this.closeProductModal());
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeProductModal();
      });
    }

    // Broadcast Modal events
    const broadcastBtn = document.getElementById('btn-open-broadcast-modal');
    const broadcastClose = document.getElementById('admin-broadcast-modal-close');
    const broadcastCancel = document.getElementById('admin-broadcast-modal-cancel');
    const broadcastOverlay = document.getElementById('admin-broadcast-modal-overlay');
    const btnConfirmBroadcast = document.getElementById('btn-confirm-send-broadcast');

    if (broadcastBtn) broadcastBtn.addEventListener('click', () => this.openBroadcastModal());
    if (broadcastClose) broadcastClose.addEventListener('click', () => this.closeBroadcastModal());
    if (broadcastCancel) broadcastCancel.addEventListener('click', () => this.closeBroadcastModal());
    if (broadcastOverlay) {
      broadcastOverlay.addEventListener('click', (e) => {
        if (e.target === broadcastOverlay) this.closeBroadcastModal();
      });
    }
    if (btnConfirmBroadcast) {
      btnConfirmBroadcast.addEventListener('click', () => this.handleSendManualBroadcast());
    }

    // Email Preview Modal events
    const emailPreviewClose = document.getElementById('email-preview-modal-close');
    const emailPreviewDone = document.getElementById('email-preview-modal-done');
    const emailPreviewOverlay = document.getElementById('email-preview-modal-overlay');

    if (emailPreviewClose) emailPreviewClose.addEventListener('click', () => this.closeEmailPreview());
    if (emailPreviewDone) emailPreviewDone.addEventListener('click', () => this.closeEmailPreview());
    if (emailPreviewOverlay) {
      emailPreviewOverlay.addEventListener('click', (e) => {
        if (e.target === emailPreviewOverlay) this.closeEmailPreview();
      });
    }

    // Admin Product Form Submit
    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProductFormSubmit();
      });
    }

    // Supabase Database Events
    const btnTestDb = document.getElementById('btn-test-db-connection');
    if (btnTestDb) {
      btnTestDb.addEventListener('click', () => this.testDatabaseConnection());
    }

    const btnSyncDb = document.getElementById('btn-sync-to-supabase');
    if (btnSyncDb) {
      btnSyncDb.addEventListener('click', () => this.syncToSupabase());
    }

    const dbForm = document.getElementById('supabase-config-form');
    if (dbForm) {
      dbForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveDatabaseConfig();
      });
    }

    const btnCopySchema = document.getElementById('btn-copy-schema-sql');
    if (btnCopySchema) {
      btnCopySchema.addEventListener('click', () => this.copySqlSchema());
    }
  },

  setupImagePreview() {
    const fileInput = document.getElementById('product-image-file');
    const urlInput = document.getElementById('product-image-url');
    const previewContainer = document.getElementById('product-image-preview-container');
    const previewImg = document.getElementById('product-image-preview');

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'flex';
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (url) {
          previewImg.src = url;
          previewContainer.style.display = 'flex';
        }
      });
    }
  },

  async loadDashboard() {
    await Promise.all([
      this.fetchStats(),
      this.fetchProducts(),
      this.fetchOrders(),
      this.fetchSubscribers(),
      this.fetchEmailLogs(),
      this.fetchDatabaseStatus()
    ]);
    this.renderOverview();
    this.renderInventoryTable();
    this.renderOrdersTable();
    this.renderSubscribersTable();
    this.renderEmailLogsTable();
    this.renderDatabasePanel();
    this.loadSchemaSql();
  },

  switchPanel(panelId) {
    this.activePanel = panelId;

    document.querySelectorAll('.admin-nav-item[data-admin-panel]').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-admin-panel') === panelId);
    });

    document.querySelectorAll('.admin-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === panelId);
    });

    if (panelId === 'admin-overview') {
      this.fetchStats().then(() => this.renderOverview());
    } else if (panelId === 'admin-inventory') {
      this.fetchProducts().then(() => this.renderInventoryTable());
    } else if (panelId === 'admin-orders') {
      this.fetchOrders().then(() => this.renderOrdersTable());
    } else if (panelId === 'admin-subscribers') {
      Promise.all([this.fetchSubscribers(), this.fetchEmailLogs()]).then(() => {
        this.renderSubscribersTable();
        this.renderEmailLogsTable();
      });
    }
  },

  async fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        this.stats = data.stats;
      }
    } catch (err) {
      console.warn('API Stats fetch note, using local fallback:', err);
    }
  },

  async fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        this.products = data.products;
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  },

  async fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        this.orders = data.orders;
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  },

  async fetchSubscribers() {
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (data.success) {
        this.subscribers = data.subscribers;
      }
    } catch (err) {
      console.error('Fetch subscribers error:', err);
    }
  },

  async fetchEmailLogs() {
    try {
      const res = await fetch('/api/email-logs');
      const data = await res.json();
      if (data.success) {
        this.emailLogs = data.logs;
      }
    } catch (err) {
      console.error('Fetch email logs error:', err);
    }
  },

  renderOverview() {
    const totalSalesEl = document.getElementById('stat-total-sales');
    const totalOrdersEl = document.getElementById('stat-total-orders');
    const avgValueEl = document.getElementById('stat-avg-value');
    const subscribersCountEl = document.getElementById('stat-total-subscribers');

    const totalSales = this.stats.totalSales || this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = this.stats.totalOrders || this.orders.length;
    const avgVal = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    const totalSubs = this.stats.totalSubscribers || this.subscribers.length;

    if (totalSalesEl) totalSalesEl.textContent = '₦' + Number(totalSales).toLocaleString();
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (avgValueEl) avgValueEl.textContent = '₦' + Number(avgVal).toLocaleString();
    if (subscribersCountEl) subscribersCountEl.textContent = totalSubs;

    this.renderRevenueChart();
    this.renderRecentActivity();
  },

  renderRevenueChart() {
    const container = document.getElementById('revenue-chart-container');
    if (!container) return;

    const months = this.stats.months || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const dataPoints = this.stats.monthlyRevenue || [320000, 480000, 610000, 790000, 920000, 1240000];
    const maxVal = Math.max(...dataPoints, 1000000);

    let barsSvg = '';
    const chartWidth = 520;
    const chartHeight = 180;
    const barWidth = 44;
    const spacing = (chartWidth - (barWidth * dataPoints.length)) / (dataPoints.length + 1);

    dataPoints.forEach((val, idx) => {
      const x = spacing + idx * (barWidth + spacing);
      const h = Math.round((val / maxVal) * 120);
      const y = chartHeight - h - 30;

      barsSvg += `
        <g class="chart-col">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="rgba(192, 133, 82, 0.45)" stroke="#C08552" stroke-width="1.5">
            <animate attributeName="height" from="0" to="${h}" dur="0.8s" fill="freeze" />
            <animate attributeName="y" from="${chartHeight - 30}" to="${y}" dur="0.8s" fill="freeze" />
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 8}" fill="#F3E9DC" font-size="10" font-family="DM Sans" text-anchor="middle">₦${Math.round(val / 1000)}k</text>
          <text x="${x + barWidth / 2}" y="${chartHeight - 10}" fill="#C08552" font-size="11" font-family="DM Sans" text-anchor="middle">${months[idx]}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="width: 100%; height: 100%; overflow: visible;">
        <line x1="0" y1="${chartHeight - 26}" x2="${chartWidth}" y2="${chartHeight - 26}" stroke="rgba(243, 233, 220, 0.2)" stroke-width="1" />
        ${barsSvg}
      </svg>
    `;
  },

  renderRecentActivity() {
    const container = document.getElementById('recent-activity-container');
    if (!container) return;

    if (!this.orders.length) {
      container.innerHTML = '<span style="color: var(--text-secondary);">No orders received yet.</span>';
      return;
    }

    container.innerHTML = this.orders.slice(0, 5).map(ord => {
      const dateStr = new Date(ord.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const firstItem = ord.items && ord.items[0] ? ord.items[0] : { title: 'Garment', size: 'M' };
      const itemDesc = `${firstItem.title} (${firstItem.size})${ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ''}`;

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div>
            <div style="font-weight:600; color:var(--text-primary); margin-bottom:2px;">
              ${ord.id} - ${ord.customer.firstName} ${ord.customer.lastName}
            </div>
            <div style="color:var(--text-secondary); font-size:12px;">${itemDesc}</div>
            <div style="color:var(--text-muted); font-size:11px; margin-top:2px;">${dateStr}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; color:var(--accent-ginger);">₦${Number(ord.total).toLocaleString()}</div>
            <span class="status-badge ${ord.status === 'Delivered' ? 'in-stock' : 'low-stock'}" style="margin-top:4px;">
              ${ord.status}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderInventoryTable() {
    const tbody = document.getElementById('admin-inventory-table-body');
    if (!tbody) return;

    if (!this.products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No garments in catalog.</td></tr>';
      return;
    }

    tbody.innerHTML = this.products.map(p => {
      const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
      const sizeStock = p.sizeStock || {};

      const sizeStockHtml = sizes.map(s => {
        const qty = sizeStock[s] !== undefined ? sizeStock[s] : '-';
        return `<span class="size-stock-tag"><strong>${s}</strong>: ${qty}</span>`;
      }).join('');

      const totalStock = p.stock || 0;
      let statusBadge = '<span class="status-badge in-stock">In Stock</span>';
      if (totalStock === 0) {
        statusBadge = '<span class="status-badge sold-out">Sold Out</span>';
      } else if (totalStock <= 5) {
        statusBadge = '<span class="status-badge low-stock">Low Stock</span>';
      }

      return `
        <tr>
          <td>
            <img src="${p.image}" class="table-thumb" alt="${p.title}" onerror="this.src='assets/images/product_hoodie_1793575280654.jpg'">
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${p.title}</div>
            <span style="font-size: 11px; color: var(--accent-ginger);">${p.badge || 'Essential'}</span>
          </td>
          <td>${p.category}</td>
          <td style="font-weight: 700;">₦${Number(p.price).toLocaleString()}</td>
          <td>
            <div class="size-stock-tag-group">${sizeStockHtml}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${totalStock}</div>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <div class="action-btn-group">
              <button class="btn-table-action" onclick="AdminApp.editProduct('${p.id}')">Edit</button>
              <button class="btn-table-action delete" onclick="AdminApp.deleteProduct('${p.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;

    if (!this.orders.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">No orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = this.orders.map(o => {
      const customer = o.customer || {};
      const itemsHtml = (o.items || []).map(item => `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <img src="${item.image || 'assets/images/product_hoodie_1793575280654.jpg'}" style="width:28px; height:34px; object-fit:cover; border-radius:2px;">
          <span>${item.title} - <strong>Size: ${item.size}</strong> × ${item.quantity}</span>
        </div>
      `).join('');

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: var(--accent-ginger);">${o.id}</td>
          <td>
            <div style="font-weight: 600;">${customer.firstName} ${customer.lastName}</div>
            <div style="font-size: 11px; color: var(--accent-ginger);">${customer.email}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${customer.phone}</div>
          </td>
          <td>${itemsHtml}</td>
          <td>
            <div style="font-size: 12px; max-width: 200px;">${customer.address}, ${customer.city}, ${customer.state}</div>
          </td>
          <td>${o.method}</td>
          <td style="font-weight: 700; font-size: 14px;">₦${Number(o.total).toLocaleString()}</td>
          <td>
            <select class="status-select" onchange="AdminApp.updateOrderStatus('${o.id}', this.value)">
              <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="In Transit" ${o.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
              <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </td>
          <td style="text-align: right;">
            <button class="btn-table-action" onclick="AdminApp.printOrderReceipt('${o.id}')">Receipt</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // EMAIL SUBSCRIBERS TABLE
  renderSubscribersTable() {
    const tbody = document.getElementById('admin-subscribers-table-body');
    const countEl = document.getElementById('admin-subscribers-count');
    if (countEl) countEl.textContent = this.subscribers.length;
    if (!tbody) return;

    if (!this.subscribers.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No customer emails captured yet.</td></tr>';
      return;
    }

    tbody.innerHTML = this.subscribers.map(sub => {
      const dateStr = sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
      const lastDrop = sub.last_notified ? new Date(sub.last_notified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-primary); font-family: monospace;">${sub.email}</td>
          <td>${sub.name || 'Valued Customer'}</td>
          <td>
            <span class="size-stock-tag" style="text-transform: uppercase;">${sub.source || 'checkout'}</span>
          </td>
          <td><strong>${sub.orders_count || 0}</strong> orders</td>
          <td style="color: var(--text-secondary);">${dateStr}</td>
          <td style="color: var(--accent-ginger); font-size: 11px;">${lastDrop}</td>
          <td style="text-align: right;">
            <button class="btn-table-action delete" onclick="AdminApp.deleteSubscriber('${sub.email}')">Unsubscribe</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // EMAIL CAMPAIGNS LOG TABLE
  renderEmailLogsTable() {
    const tbody = document.getElementById('admin-email-logs-table-body');
    const campCountEl = document.getElementById('admin-campaigns-count');
    if (campCountEl) campCountEl.textContent = this.emailLogs.length;
    if (!tbody) return;

    if (!this.emailLogs.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No drop email campaigns logged yet.</td></tr>';
      return;
    }

    tbody.innerHTML = this.emailLogs.map(log => {
      const dateStr = log.sent_at ? new Date(log.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const prodTitle = log.product ? log.product.title : 'New Drop Silhouette';

      return `
        <tr>
          <td class="font-mono" style="font-weight: 700; color: var(--accent-ginger);">${log.id}</td>
          <td style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
            ${log.subject}
          </td>
          <td>${prodTitle}</td>
          <td><span class="status-badge in-stock">${log.recipientsCount || (log.recipients ? log.recipients.length : 0)} Emails</span></td>
          <td style="color: var(--text-secondary);">${dateStr}</td>
          <td><span class="status-badge in-stock">Dispatched</span></td>
          <td style="text-align: right;">
            <button class="btn-table-action" onclick="AdminApp.previewEmailLog('${log.id}')">View Email</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  previewEmailLog(logId) {
    const log = this.emailLogs.find(l => l.id === logId);
    if (!log) return;

    const overlay = document.getElementById('email-preview-modal-overlay');
    const subjectEl = document.getElementById('email-preview-subject');
    const container = document.getElementById('email-preview-frame-container');

    subjectEl.textContent = log.subject;
    container.innerHTML = log.htmlPreview || `
      <div style="padding: 30px; text-align: center; color: white;">
        <h3>${log.subject}</h3>
        <p>Dispatched to ${log.recipientsCount} customer emails.</p>
      </div>
    `;

    overlay.classList.add('active');
  },

  closeEmailPreview() {
    const overlay = document.getElementById('email-preview-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  // MANUAL BROADCAST MODAL
  openBroadcastModal() {
    const overlay = document.getElementById('admin-broadcast-modal-overlay');
    const select = document.getElementById('broadcast-product-select');
    const preview = document.getElementById('broadcast-recipient-preview');

    if (select) {
      select.innerHTML = this.products.map(p => `
        <option value="${p.id}">${p.title} (₦${Number(p.price).toLocaleString()})</option>
      `).join('');
    }

    if (preview) {
      preview.innerHTML = `Will dispatch to <strong>${this.subscribers.length} customer emails</strong> captured from checkout & VIP signups.`;
    }

    overlay.classList.add('active');
  },

  closeBroadcastModal() {
    const overlay = document.getElementById('admin-broadcast-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  async handleSendManualBroadcast() {
    const select = document.getElementById('broadcast-product-select');
    const productId = select.value;

    try {
      const res = await fetch('/api/broadcast-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        if (window.StoreApp) window.StoreApp.showToast(data.message);
        this.closeBroadcastModal();
        await Promise.all([this.fetchSubscribers(), this.fetchEmailLogs()]);
        this.renderSubscribersTable();
        this.renderEmailLogsTable();
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      alert('Unable to send broadcast.');
    }
  },

  async deleteSubscriber(email) {
    if (!confirm(`Unsubscribe ${email} from drop notifications?`)) return;

    try {
      const res = await fetch(`/api/subscribers/${encodeURIComponent(email)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (window.StoreApp) window.StoreApp.showToast(`Unsubscribed ${email}`);
        await this.fetchSubscribers();
        this.renderSubscribersTable();
      }
    } catch (err) {
      console.error('Delete subscriber error:', err);
    }
  },

  openProductModal(product = null) {
    const modalOverlay = document.getElementById('admin-product-modal-overlay');
    const modalTitle = document.getElementById('admin-modal-title');
    const form = document.getElementById('admin-product-form');
    const idInput = document.getElementById('edit-product-id');
    const previewContainer = document.getElementById('product-image-preview-container');
    const previewImg = document.getElementById('product-image-preview');

    form.reset();
    previewContainer.style.display = 'none';

    if (product) {
      modalTitle.textContent = 'Edit Atelier Garment';
      idInput.value = product.id;
      document.getElementById('product-title').value = product.title || '';
      document.getElementById('product-category').value = product.category || 'Hoodies';
      document.getElementById('product-price').value = product.price || 48000;
      document.getElementById('product-description').value = product.description || '';
      document.getElementById('product-stock').value = product.stock || 20;
      document.getElementById('product-color').value = product.color || '#D4772C';
      document.getElementById('product-sizes').value = (product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).join(', ');
      document.getElementById('product-badge').value = product.badge || 'New Drop';
      document.getElementById('product-image-url').value = product.image || '';

      if (product.image) {
        previewImg.src = product.image;
        previewContainer.style.display = 'flex';
      }
    } else {
      modalTitle.textContent = 'Add New Atelier Garment';
      idInput.value = '';
      document.getElementById('product-category').value = 'Hoodies';
      document.getElementById('product-stock').value = 24;
      document.getElementById('product-color').value = '#D4772C';
      document.getElementById('product-sizes').value = 'XS, S, M, L, XL, XXL';
      document.getElementById('product-badge').value = 'New Drop';
      document.getElementById('product-notify-subscribers').checked = true;
    }

    modalOverlay.classList.add('active');
  },

  closeProductModal() {
    const modalOverlay = document.getElementById('admin-product-modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  async handleProductFormSubmit() {
    const id = document.getElementById('edit-product-id').value;
    const title = document.getElementById('product-title').value;
    const category = document.getElementById('product-category').value;
    const price = Number(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = Number(document.getElementById('product-stock').value);
    const color = document.getElementById('product-color').value;
    const sizesStr = document.getElementById('product-sizes').value;
    const badge = document.getElementById('product-badge').value;
    const notifySubscribers = document.getElementById('product-notify-subscribers') ? document.getElementById('product-notify-subscribers').checked : true;
    const fileInput = document.getElementById('product-image-file');
    let imageUrl = document.getElementById('product-image-url').value.trim();

    if (fileInput.files && fileInput.files[0]) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    if (!imageUrl) {
      imageUrl = 'assets/images/product_hoodie_1793575280654.jpg';
    }

    const sizes = sizesStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const sizeStock = {};
    sizes.forEach(s => {
      sizeStock[s] = Math.max(1, Math.floor(stock / sizes.length));
    });

    const payload = {
      title,
      category,
      price,
      description,
      stock,
      color,
      sizes,
      sizeStock,
      badge,
      image: imageUrl,
      notifySubscribers
    };

    try {
      let res;
      if (id) {
        res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        let msg = id ? 'Garment updated successfully' : 'New garment published to storefront!';
        if (!id && data.emailDispatched && data.emailDispatched.count > 0) {
          msg += ` & Drop email sent to ${data.emailDispatched.count} customer inboxes!`;
        }
        if (window.StoreApp) window.StoreApp.showToast(msg);
        this.closeProductModal();
        await Promise.all([this.fetchProducts(), this.fetchEmailLogs(), this.fetchSubscribers()]);
        this.renderInventoryTable();
        this.renderEmailLogsTable();
        this.renderSubscribersTable();
        if (window.StoreApp) window.StoreApp.loadProducts();
      }
    } catch (err) {
      console.error('Save product error:', err);
      alert('Failed to save product to Node.js backend.');
    }
  },

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.openProductModal(product);
    }
  },

  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this garment from the catalog?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (window.StoreApp) window.StoreApp.showToast('Garment deleted from catalog');
        await this.fetchProducts();
        this.renderInventoryTable();
        if (window.StoreApp) window.StoreApp.loadProducts();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        if (window.StoreApp) window.StoreApp.showToast(`Order ${orderId} marked as ${newStatus}`);
        await this.fetchOrders();
      }
    } catch (err) {
      console.error('Update order status error:', err);
    }
  },

  async resetDefaultCatalog() {
    try {
      const res = await fetch('/api/products/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (window.StoreApp) window.StoreApp.showToast('Catalog restored to default pieces');
        await this.fetchProducts();
        this.renderInventoryTable();
        if (window.StoreApp) window.StoreApp.loadProducts();
      }
    } catch (err) {
      console.error('Reset catalog error:', err);
    }
  },

  printOrderReceipt(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    if (window.StoreApp) {
      window.StoreApp.showReceipt(order);
    }
  },

  // ==========================================
  // SUPABASE DATABASE METHODS
  // ==========================================
  async fetchDatabaseStatus() {
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      if (data.success) {
        this.dbStatus = data;
        this.renderDatabasePanel();
      }
    } catch (err) {
      console.warn('Database status fetch notice:', err.message);
    }
  },

  renderDatabasePanel() {
    const isConn = Boolean(this.dbStatus && this.dbStatus.connected);
    const provider = (this.dbStatus && this.dbStatus.provider) || 'local_json_cache';
    const url = (this.dbStatus && this.dbStatus.url) || '';

    // Update Overview header pill
    const overviewPill = document.getElementById('overview-db-status-pill');
    if (overviewPill) {
      overviewPill.innerHTML = isConn
        ? '<span class="pulse-dot" style="background:#2ECC71;"></span> Supabase Connected'
        : '<span class="pulse-dot" style="background:#A0A0A8;"></span> Local Cache (Supabase Ready)';
    }

    // Update Database panel elements
    const statusLabel = document.getElementById('db-status-label');
    const chip = document.getElementById('db-connection-chip');
    const subtext = document.getElementById('db-status-subtext');
    const providerName = document.getElementById('db-provider-name');
    const urlInput = document.getElementById('db-supabase-url');

    if (statusLabel) {
      statusLabel.textContent = isConn
        ? `Supabase Cloud PostgreSQL (${url})`
        : 'Local JSON Cache (Supabase Ready)';
    }

    if (chip) {
      chip.className = isConn ? 'db-chip connected' : 'db-chip fallback';
      chip.textContent = isConn ? 'CLOUD CONNECTED' : 'OFFLINE RESILIENT';
    }

    if (subtext) {
      subtext.textContent = isConn
        ? 'Gingertrendz is synchronizing live with your Supabase PostgreSQL cluster with full Row Level Security.'
        : 'Gingertrendz is currently operating in offline resilient mode. Save your Supabase URL & Key below to switch to Cloud PostgreSQL.';
        ? 'The platform is synchronizing live with your Supabase PostgreSQL cluster with full Row Level Security.'
  : 'The platform is currently operating in offline resilient mode. Save your Supabase URL & Key below to switch to Cloud PostgreSQL.';
    }

if (providerName) {
  providerName.textContent = provider.toUpperCase();
}

if (urlInput && url && !urlInput.value) {
  urlInput.value = url;
}

// Update table count metrics
const metricProducts = document.getElementById('metric-products-count');
const metricOrders = document.getElementById('metric-orders-count');
const metricSubs = document.getElementById('metric-subscribers-count');
const metricLogs = document.getElementById('metric-logs-count');

if (metricProducts) metricProducts.textContent = `${this.products.length} garments`;
if (metricOrders) metricOrders.textContent = `${this.orders.length} orders`;
if (metricSubs) metricSubs.textContent = `${this.subscribers.length} subscribers`;
if (metricLogs) metricLogs.textContent = `${this.emailLogs.length} drop broadcasts`;
  },

  async testDatabaseConnection() {
  const btn = document.getElementById('btn-test-db-connection');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/database/test', { method: 'POST' });
    const data = await res.json();

    if (data.connected) {
      if (window.StoreApp) window.StoreApp.showToast('🟢 ' + data.message);
    } else {
      if (window.StoreApp) window.StoreApp.showToast('🟡 ' + data.message);
    }
    await this.fetchDatabaseStatus();
  } catch (err) {
    if (window.StoreApp) window.StoreApp.showToast('Connection test failed: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
},

  async saveDatabaseConfig() {
  const urlInput = document.getElementById('db-supabase-url');
  const keyInput = document.getElementById('db-supabase-key');
  const msgBox = document.getElementById('db-config-message');
  const saveBtn = document.getElementById('btn-save-db-config');

  if (!urlInput || !keyInput) return;
  const url = urlInput.value.trim();
  const key = keyInput.value.trim();

  if (!url || !key) {
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.style.backgroundColor = 'rgba(231, 76, 60, 0.15)';
      msgBox.style.border = '1px solid rgba(231, 76, 60, 0.4)';
      msgBox.style.color = '#E74C3C';
      msgBox.textContent = 'Please enter both your Supabase URL and API Key.';
    }
    return;
  }

  if (saveBtn) saveBtn.disabled = true;
  if (msgBox) {
    msgBox.style.display = 'block';
    msgBox.style.backgroundColor = 'rgba(230, 189, 123, 0.1)';
    msgBox.style.border = '1px solid rgba(230, 189, 123, 0.3)';
    msgBox.style.color = 'var(--accent-gilded)';
    msgBox.textContent = 'Connecting and verifying credentials with Supabase...';
  }

  try {
    const res = await fetch('/api/database/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key })
    });
    const data = await res.json();

    if (data.success) {
      if (msgBox) {
        msgBox.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        msgBox.style.border = '1px solid rgba(46, 204, 113, 0.4)';
        msgBox.style.color = '#2ECC71';
        msgBox.textContent = '✓ ' + data.message;
      }
      if (window.StoreApp) window.StoreApp.showToast('Supabase PostgreSQL connected successfully!');
    } else {
      if (msgBox) {
        msgBox.style.backgroundColor = 'rgba(243, 156, 18, 0.15)';
        msgBox.style.border = '1px solid rgba(243, 156, 18, 0.4)';
        msgBox.style.color = '#F39C12';
        msgBox.textContent = 'Configuration saved, but connection check returned: ' + data.message;
      }
    }
    await this.fetchDatabaseStatus();
  } catch (err) {
    if (msgBox) {
      msgBox.style.backgroundColor = 'rgba(231, 76, 60, 0.15)';
      msgBox.style.border = '1px solid rgba(231, 76, 60, 0.4)';
      msgBox.style.color = '#E74C3C';
      msgBox.textContent = 'Connection error: ' + err.message;
    }
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
},

  async syncToSupabase() {
  const btn = document.getElementById('btn-sync-to-supabase');
  if (btn) btn.disabled = true;

  try {
    if (window.StoreApp) window.StoreApp.showToast('Syncing catalog & customer records to Supabase...');
    const res = await fetch('/api/database/sync', { method: 'POST' });
    const data = await res.json();

    if (data.success) {
      if (window.StoreApp) {
        window.StoreApp.showToast(`✓ Synced: ${data.synced.products} garments, ${data.synced.orders} orders, ${data.synced.subscribers} emails to Supabase!`);
      }
      await this.fetchDatabaseStatus();
    } else {
      if (window.StoreApp) window.StoreApp.showToast(`Sync Notice: ${data.message}`);
    }
  } catch (err) {
    if (window.StoreApp) window.StoreApp.showToast('Sync error: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
},

  async loadSchemaSql() {
  const previewEl = document.getElementById('schema-sql-preview');
  if (!previewEl || previewEl.getAttribute('data-loaded') === 'true') return;

  try {
    const res = await fetch('/api/database/schema');
    const data = await res.json();
    if (data.success) {
      previewEl.textContent = data.schema;
      previewEl.setAttribute('data-loaded', 'true');
      this.rawSchemaSql = data.schema;
    }
  } catch (err) {
    console.warn('Could not fetch schema SQL:', err.message);
  }
},

copySqlSchema() {
  const previewEl = document.getElementById('schema-sql-preview');
  const textToCopy = this.rawSchemaSql || (previewEl ? previewEl.textContent : '');

  if (!textToCopy) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (window.StoreApp) window.StoreApp.showToast('✓ Supabase SQL Schema copied to clipboard!');
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (window.StoreApp) window.StoreApp.showToast('✓ Supabase SQL Schema copied to clipboard!');
  }
},

logout() {
  localStorage.removeItem('gt_admin_token');
  if (window.StoreApp) {
    window.StoreApp.adminLoggedIn = false;
    window.StoreApp.showView('storefront');
    window.StoreApp.showToast('Logged out from Curator Workspace');
  }
}
};

window.AdminApp = AdminApp;
