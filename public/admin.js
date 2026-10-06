// Admin Application State
const adminState = {
  settings: {},
  categories: [],
  items: [],
  orders: [],
  stats: {},
  activeTab: 'dashboard',
  searchQuery: '',
  categoryFilter: 'all',
  dietFilter: 'all'
};

// Polling interval for live orders
let ordersPollingInterval = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchAdminData();
  setupAdminListeners();
  initCloudSettings();
  
  // Auto-refresh orders every 8 seconds for real-time kitchen display
  ordersPollingInterval = setInterval(() => {
    fetchOrdersSilently();
  }, 8000);
});

// Fetch Full Dataset & Stats from Cloud / Server
async function fetchAdminData() {
  const cfg = window.FIREBASE_CONFIG;
  let loadedFromFirebase = false;

  // 1. Priority 1: Fetch directly from Firebase Cloud (Single Source of Truth)
  if (cfg && cfg.databaseURL) {
    try {
      const fbRes = await fetch(`${cfg.databaseURL}/menu.json?t=${Date.now()}`);
      const cloudData = await fbRes.json();
      if (cloudData && cloudData.items && cloudData.items.length) {
        adminState.settings = cloudData.settings || {};
        adminState.categories = cloudData.categories || [];
        adminState.items = cloudData.items || [];
        loadedFromFirebase = true;
        console.log('⚡ Admin loaded directly from Firebase Cloud (items:', adminState.items.length, ')');
      }
    } catch (fbErr) {
      console.warn('Firebase direct load warning:', fbErr);
    }
  }

  // 2. Priority 2: Fallback to local /api/data ONLY if Firebase didn't load
  if (!loadedFromFirebase) {
    try {
      const dataRes = await fetch('/api/data');
      const dbData = await dataRes.json();
      if (dbData.success) {
        adminState.settings = dbData.data.settings || {};
        adminState.categories = dbData.data.categories || [];
        adminState.items = dbData.data.items || [];
        adminState.orders = dbData.data.orders || [];
      }
    } catch (apiErr) {
      console.warn('API fallback error:', apiErr);
    }
  }

  // Calculate stats dynamically
  const totalItems = adminState.items.length;
  const inStockCount = adminState.items.filter(i => i.isAvailable !== false).length;
  adminState.stats = {
    totalItems,
    inStockCount,
    outOfStockCount: totalItems - inStockCount,
    vegCount: adminState.items.filter(i => i.isVeg).length,
    totalCategories: adminState.categories.length,
    activeOrders: 0,
    totalRevenue: 0
  };

  updateHeaderAndSidebar();
  renderDashboard();
  renderMenuItems();
  renderCategories();
  renderOrders();
  populateCategoryDropdowns();
  populateTableSelectors();
  populateSettingsForm();
  generateQrCodePreview();
}

// Silent fetch for live kitchen updates
async function fetchOrdersSilently() {
  try {
    const res = await fetch('/api/data');
    const dbData = await res.json();
    if (dbData.success) {
      const prevCount = adminState.orders.length;
      adminState.orders = dbData.data.orders || [];
      if (adminState.orders.length > prevCount) {
        showAdminToast('🔔 New live order received!', 'warning');
      }
      renderOrders();
      renderDashboardOrders();
      updateHeaderAndSidebar();
    }
  } catch (e) {}
}

// Sidebar & Tab Management
function switchTab(tabId) {
  adminState.activeTab = tabId;

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tabBtn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update panes
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');

  // Update Page Title
  const titles = {
    dashboard: 'Dashboard Overview',
    menu: 'Menu Items Management',
    categories: 'Category Management',
    orders: 'Live Kitchen Display (KDS)',
    qr: 'Table QR Code Generator',
    settings: 'Restaurant Profile & Settings'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Admin Panel';

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('mobileBackdrop');
  if (sidebar && backdrop && !sidebar.classList.contains('-translate-x-full')) {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('mobileBackdrop');
  if (sidebar && backdrop) {
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    }
  }
}

function updateHeaderAndSidebar() {
  const restName = adminState.settings.restaurantName || 'La Mensa';
  const sidebarName = document.getElementById('sidebarRestName');
  if (sidebarName) sidebarName.textContent = restName;

  const qrCardRest = document.getElementById('qrCardRestName');
  if (qrCardRest) qrCardRest.textContent = restName;

  const itemCountEl = document.getElementById('sidebarItemCount');
  if (itemCountEl) itemCountEl.textContent = adminState.items.length;

  const catCountEl = document.getElementById('sidebarCatCount');
  if (catCountEl) catCountEl.textContent = adminState.categories.length;

  const activeOrdersCount = adminState.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const orderBadgeEl = document.getElementById('sidebarOrderBadge');
  if (orderBadgeEl) {
    orderBadgeEl.textContent = activeOrdersCount;
    orderBadgeEl.classList.toggle('hidden', activeOrdersCount === 0);
  }
}

// 1. DASHBOARD TAB RENDERING
function renderDashboard() {
  const inStock = adminState.items.filter(i => i.isAvailable !== false).length;
  const outOfStock = adminState.items.length - inStock;
  const jainCount = adminState.items.filter(i => i.isJain).length;
  const activeOrders = adminState.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

  document.getElementById('statTotalItems').textContent = adminState.items.length;
  document.getElementById('statInStock').textContent = `${inStock} In Stock`;
  document.getElementById('statOutOfStock').textContent = `${outOfStock} Sold Out`;
  document.getElementById('statTotalCats').textContent = adminState.categories.length;
  document.getElementById('statActiveOrders').textContent = activeOrders;
  document.getElementById('statVeg').textContent = `${adminState.items.length} 🟢`;
  document.getElementById('statNonVeg').textContent = `(${jainCount} Jain 🟡)`;

  renderDashboardOrders();
}

function renderDashboardOrders() {
  const container = document.getElementById('dashboardOrdersList');
  if (!container) return;

  const recentOrders = adminState.orders.slice(0, 4);
  const currency = adminState.settings.currencySymbol || '₹';

  if (recentOrders.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-500 text-xs">
        <i class="fa-solid fa-receipt text-2xl mb-2 opacity-50"></i>
        <p>No orders in queue.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recentOrders.map(order => `
    <div class="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-2xl flex items-center justify-between transition text-xs">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-slate-700/60 text-amber-400 flex items-center justify-center font-extrabold text-xs">
          ${order.tableNumber.replace('Table ', 'T')}
        </div>
        <div>
          <div class="font-bold text-white flex items-center gap-2">
            <span>${order.tableNumber}</span>
            <span class="text-slate-400 font-normal">• ${order.customerName || 'Guest'}</span>
          </div>
          <span class="text-[11px] text-slate-400">
            ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'} • ${currency}${order.total.toFixed(0)}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="status-badge status-${order.status}">${order.status}</span>
        <button onclick="switchTab('orders')" class="p-1.5 text-slate-400 hover:text-white">
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// 2. MENU ITEMS MANAGEMENT
function renderMenuItems() {
  const tbody = document.getElementById('adminItemsTableBody');
  if (!tbody) return;

  const currency = adminState.settings.currencySymbol || '₹';

  // Apply search and filters
  let filtered = adminState.items.filter(item => {
    if (adminState.searchQuery) {
      const matchName = item.name.toLowerCase().includes(adminState.searchQuery);
      const matchDesc = (item.description || '').toLowerCase().includes(adminState.searchQuery);
      if (!matchName && !matchDesc) return false;
    }
    if (adminState.categoryFilter !== 'all' && item.categoryId !== adminState.categoryFilter) {
      return false;
    }
    if (adminState.dietFilter === 'jain' && !item.isJain) return false;
    if (adminState.dietFilter === 'special' && !item.isChefSpecial) return false;
    if (adminState.dietFilter === 'bestseller' && !item.isBestseller) return false;
    if (adminState.dietFilter === 'outofstock' && item.isAvailable !== false) return false;

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-12 text-center text-slate-500">
          <i class="fa-solid fa-utensils text-2xl mb-2 opacity-50 block"></i>
          No dishes found matching criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const category = adminState.categories.find(c => c.id === item.categoryId);
    const catName = category ? `${category.icon || ''} ${category.name}` : (item.categoryName || 'General');
    const isAvailable = item.isAvailable !== false;

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <!-- Dish Info -->
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-3">
            <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" 
                 alt="${item.name}" 
                 class="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                 onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'"
            />
            <div>
              <div class="font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>${item.name}</span>
                ${item.isJain ? '<span class="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">🟡 Jain</span>' : ''}
                ${item.isChefSpecial ? '<span class="text-[10px] text-amber-400 font-bold">⭐ Special</span>' : ''}
                ${item.isBestseller ? '<span class="text-[10px] text-emerald-400 font-bold">Popular</span>' : ''}
              </div>
              <span class="text-[11px] text-slate-400 line-clamp-1 max-w-xs">${item.description || 'No description'}</span>
            </div>
          </div>
        </td>

        <!-- Category -->
        <td class="px-4 py-3.5">
          <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/50">
            ${catName}
          </span>
        </td>

        <!-- Price -->
        <td class="px-4 py-3.5">
          <div class="font-bold text-amber-400 text-sm">${currency}${item.price}</div>
          ${item.originalPrice ? `<span class="text-[10px] text-slate-500 line-through">${currency}${item.originalPrice}</span>` : ''}
        </td>

        <!-- Diet & Spice -->
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-2">
            <span class="veg-indicator" title="100% Pure Veg"></span>
            <span class="text-[11px] font-semibold text-slate-300">
              ${item.isSpicy || item.spiceLevel >= 2 ? '🌶️ Spicy' : 'Non-Spicy'}
            </span>
          </div>
        </td>

        <!-- In Stock Toggle -->
        <td class="px-4 py-3.5">
          <button onclick="toggleItemStock('${item.id}')" class="px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${isAvailable ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}">
            <span class="w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
            <span>${isAvailable ? 'In Stock' : 'Out of Stock'}</span>
          </button>
        </td>

        <!-- Actions -->
        <td class="px-4 py-3.5 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openEditItemModal('${item.id}')" title="Edit Dish" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')" title="Delete Dish" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 transition">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle In-Stock status
async function toggleItemStock(itemId) {
  const item = adminState.items.find(i => i.id === itemId);
  if (!item) return;

  item.isAvailable = item.isAvailable === false ? true : false;
  showAdminToast(`Stock status set to ${item.isAvailable ? 'In Stock' : 'Out of stock'}`, 'success');
  renderMenuItems();
  updateHeaderAndSidebar();
  renderDashboard();

  await pushStateToFirebase();

  // Background fallback
  fetch(`/api/items/${itemId}/toggle-stock`, { method: 'PATCH' }).catch(() => {});
}

// Item Modal Management
function openAddItemModal() {
  document.getElementById('itemModalTitle').textContent = 'Add New Dish';
  document.getElementById('formItemId').value = '';
  document.getElementById('itemForm').reset();
  document.getElementById('formItemIsAvailable').checked = true;
  document.getElementById('formItemIsJain').checked = false;
  document.getElementById('formItemIsChefSpecial').checked = false;
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  document.getElementById('imgUploadStatus').textContent = '';
  document.getElementById('itemModal').classList.remove('hidden');
}

function openEditItemModal(itemId) {
  const item = adminState.items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('itemModalTitle').textContent = 'Edit Dish Details';
  document.getElementById('formItemId').value = item.id;
  document.getElementById('formItemName').value = item.name;
  document.getElementById('formItemCategory').value = item.categoryId;
  document.getElementById('formItemIsVeg').value = item.isVeg !== false ? 'true' : 'false';
  document.getElementById('formItemPrice').value = item.price;
  document.getElementById('formItemOriginalPrice').value = item.originalPrice || '';
  document.getElementById('formItemSpiceLevel').value = item.spiceLevel || 0;
  document.getElementById('formItemPortion').value = item.portion || '';
  document.getElementById('formItemImage').value = item.image || '';
  document.getElementById('formItemDesc').value = item.description || '';
  document.getElementById('formItemIsJain').checked = Boolean(item.isJain);
  document.getElementById('formItemIsChefSpecial').checked = Boolean(item.isChefSpecial);
  document.getElementById('formItemIsBestseller').checked = Boolean(item.isBestseller);
  document.getElementById('formItemIsAvailable').checked = item.isAvailable !== false;

  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewThumb = document.getElementById('imagePreviewThumb');
  if (item.image) {
    previewThumb.src = item.image;
    previewContainer.classList.remove('hidden');
  } else {
    previewContainer.classList.add('hidden');
  }
  document.getElementById('imgUploadStatus').textContent = '';

  document.getElementById('itemModal').classList.remove('hidden');
}

function closeItemModal() {
  document.getElementById('itemModal').classList.add('hidden');
}

async function saveItem(e) {
  e.preventDefault();
  const itemId = document.getElementById('formItemId').value;

  const payload = {
    id: itemId || ('item-' + Date.now()),
    name: document.getElementById('formItemName').value.trim(),
    categoryId: document.getElementById('formItemCategory').value,
    isVeg: true,
    price: Number(document.getElementById('formItemPrice').value),
    originalPrice: document.getElementById('formItemOriginalPrice').value ? Number(document.getElementById('formItemOriginalPrice').value) : null,
    spiceLevel: Number(document.getElementById('formItemSpiceLevel').value),
    portion: document.getElementById('formItemPortion').value.trim() || 'Serves 1-2',
    image: document.getElementById('formItemImage').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: document.getElementById('formItemDesc').value.trim(),
    isJain: document.getElementById('formItemIsJain').checked,
    isChefSpecial: document.getElementById('formItemIsChefSpecial').checked,
    isBestseller: document.getElementById('formItemIsBestseller').checked,
    isAvailable: document.getElementById('formItemIsAvailable').checked
  };

  if (itemId) {
    const idx = adminState.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      adminState.items[idx] = { ...adminState.items[idx], ...payload };
    }
  } else {
    adminState.items.unshift(payload);
  }

  closeItemModal();
  showAdminToast(itemId ? 'Dish updated successfully' : 'New dish added successfully', 'success');
  renderMenuItems();
  updateHeaderAndSidebar();
  renderDashboard();

  await pushStateToFirebase();

  // Background fallback
  const url = itemId ? `/api/items/${itemId}` : '/api/items';
  const method = itemId ? 'PUT' : 'POST';
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

async function deleteItem(itemId, name) {
  if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;

  adminState.items = adminState.items.filter(i => i.id !== itemId);
  showAdminToast(`Deleted "${name}"`, 'success');
  renderMenuItems();
  updateHeaderAndSidebar();
  renderDashboard();

  await pushStateToFirebase();

  fetch(`/api/items/${itemId}`, { method: 'DELETE' }).catch(() => {});
}

// 3. CATEGORIES MANAGEMENT
function renderCategories() {
  const container = document.getElementById('adminCategoryGrid');
  if (!container) return;

  container.innerHTML = adminState.categories.map(cat => {
    const itemCount = adminState.items.filter(i => i.categoryId === cat.id).length;

    return `
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
              ${cat.icon || '🍽️'}
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              ${itemCount} ${itemCount === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>

          <h4 class="font-bold text-base text-white mb-1">${cat.name}</h4>
          <p class="text-xs text-slate-400 line-clamp-2">${cat.subtitle || cat.description || 'Category'}</p>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button onclick="openEditCategoryModal('${cat.id}')" class="text-xs font-semibold text-amber-400 hover:text-amber-300">
            <i class="fa-solid fa-pen-to-square mr-1"></i> Edit
          </button>
          <button onclick="deleteCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', ${itemCount})" class="text-xs font-semibold text-rose-400 hover:text-rose-300">
            <i class="fa-solid fa-trash mr-1"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddCategoryModal() {
  document.getElementById('categoryModalTitle').textContent = 'Add New Category';
  document.getElementById('formCatId').value = '';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryModal').classList.remove('hidden');
}

function openEditCategoryModal(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  document.getElementById('formCatId').value = cat.id;
  document.getElementById('formCatName').value = cat.name;
  document.getElementById('formCatIcon').value = cat.icon || '';
  document.getElementById('formCatDesc').value = cat.subtitle || cat.description || '';
  document.getElementById('categoryModal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
}

async function saveCategory(e) {
  e.preventDefault();
  const catId = document.getElementById('formCatId').value;

  const payload = {
    name: document.getElementById('formCatName').value.trim(),
    icon: document.getElementById('formCatIcon').value.trim() || '🍽️',
    description: document.getElementById('formCatDesc').value.trim(),
    subtitle: document.getElementById('formCatDesc').value.trim()
  };

  if (catId) {
    const cat = adminState.categories.find(c => c.id === catId);
    if (cat) {
      cat.name = payload.name;
      cat.icon = payload.icon;
      cat.description = payload.description;
      cat.subtitle = payload.subtitle;
    }
  } else {
    adminState.categories.push({
      id: 'cat-' + Date.now(),
      name: payload.name,
      icon: payload.icon,
      description: payload.description,
      subtitle: payload.subtitle,
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
  }

  closeCategoryModal();
  showAdminToast(catId ? 'Category updated' : 'Category created', 'success');
  renderCategories();
  populateCategoryDropdowns();
  updateHeaderAndSidebar();

  await pushStateToFirebase();

  // Background fallback
  const url = catId ? `/api/categories/${catId}` : '/api/categories';
  const method = catId ? 'PUT' : 'POST';
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

async function deleteCategory(catId, name, itemCount) {
  if (itemCount > 0) {
    alert(`Cannot delete category "${name}" because it contains ${itemCount} dishes. Move or delete the dishes first.`);
    return;
  }

  if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

  adminState.categories = adminState.categories.filter(c => c.id !== catId);
  showAdminToast(`Category "${name}" deleted`, 'success');
  renderCategories();
  populateCategoryDropdowns();
  updateHeaderAndSidebar();

  await pushStateToFirebase();

  fetch(`/api/categories/${catId}`, { method: 'DELETE' }).catch(() => {});
}

// 4. KITCHEN ORDERS DISPLAY (KDS)
function renderOrders() {
  const container = document.getElementById('adminOrdersGrid');
  if (!container) return;

  const currency = adminState.settings.currencySymbol || '₹';

  if (adminState.orders.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500">
        <i class="fa-solid fa-bell-concierge text-4xl mb-3 opacity-40"></i>
        <h4 class="text-base font-bold text-slate-300">No active kitchen orders</h4>
        <p class="text-xs text-slate-500 mt-1">Orders placed from table menu or WhatsApp will arrive in real-time.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = adminState.orders.map(order => {
    const timeFormatted = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="p-5 bg-slate-900 border ${order.status === 'Pending' ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-800'} rounded-3xl flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-extrabold text-white">${order.tableNumber}</span>
                <span class="text-xs text-slate-400 font-medium">(${order.id})</span>
              </div>
              <span class="text-xs text-slate-400 mt-0.5 block">Guest: ${order.customerName || 'Walk-in'} • ${timeFormatted}</span>
            </div>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </div>

          <!-- Items Ordered -->
          <div class="space-y-2 mb-4">
            ${order.items.map(i => `
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-200">${i.qty}x ${i.name}</span>
                  ${i.isJain ? '<span class="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-1 rounded">Jain</span>' : ''}
                </div>
                <span class="text-slate-400 font-semibold">${currency}${i.price * i.qty}</span>
              </div>
            `).join('')}
          </div>

          <!-- Notes -->
          ${order.notes ? `
            <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 mb-4 flex items-start gap-1.5">
              <i class="fa-solid fa-message text-[10px] mt-0.5"></i>
              <span><strong>Note:</strong> ${order.notes}</span>
            </div>
          ` : ''}
        </div>

        <!-- Order Footer & Status Actions -->
        <div>
          <div class="flex items-center justify-between py-2 border-t border-slate-800 text-xs font-bold text-white mb-3">
            <span>Grand Total</span>
            <span class="text-sm font-extrabold text-amber-400">${currency}${order.total.toFixed(2)}</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            ${order.status === 'Pending' ? `
              <button onclick="updateOrderStatus('${order.id}', 'Preparing')" class="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition">
                Start Preparing
              </button>
            ` : order.status === 'Preparing' ? `
              <button onclick="updateOrderStatus('${order.id}', 'Served')" class="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition">
                Mark as Served
              </button>
            ` : order.status === 'Served' ? `
              <button onclick="updateOrderStatus('${order.id}', 'Completed')" class="py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition">
                Mark Completed
              </button>
            ` : `
              <button disabled class="py-2 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed">
                Done
              </button>
            `}

            <button onclick="deleteOrder('${order.id}')" class="py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 font-semibold text-xs rounded-xl transition">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`Order status updated to ${newStatus}`, 'success');
      fetchAdminData();
    }
  } catch (err) {
    showAdminToast('Failed to update status', 'error');
  }
}

async function deleteOrder(orderId) {
  if (!confirm(`Delete order ${orderId}?`)) return;

  try {
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Order removed', 'info');
      fetchAdminData();
    }
  } catch (err) {
    showAdminToast('Failed to delete order', 'error');
  }
}

// 5. QR CODE GENERATOR
function populateTableSelectors() {
  const select = document.getElementById('qrTableSelector');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">General Menu (All Tables)</option>';

  const count = adminState.settings.tableCount || 25;
  for (let i = 1; i <= count; i++) {
    const opt = document.createElement('option');
    opt.value = `Table ${i}`;
    opt.textContent = `Table ${i}`;
    select.appendChild(opt);
  }
  select.value = currentVal || '';
}

function generateQrCodePreview() {
  const table = document.getElementById('qrTableSelector') ? document.getElementById('qrTableSelector').value : '';
  const restName = adminState.settings.restaurantName || 'La Mensa';
  
  const baseUrl = window.location.origin;
  const targetUrl = table ? `${baseUrl}/?table=${encodeURIComponent(table)}` : baseUrl;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(targetUrl)}&color=0e2a22&bgcolor=ffffff&margin=1`;

  const previewImg = document.getElementById('adminQrPreviewImg');
  const downloadBtn = document.getElementById('adminQrDownloadBtn');
  const titleEl = document.getElementById('qrCardTableTitle');
  const restNameEl = document.getElementById('qrCardRestName');

  if (previewImg) previewImg.src = qrUrl;
  if (downloadBtn) downloadBtn.href = qrUrl;
  if (titleEl) titleEl.textContent = table ? table : 'Digital Menu';
  if (restNameEl) restNameEl.textContent = restName;
}

// 6. RESTAURANT SETTINGS
function populateSettingsForm() {
  const s = adminState.settings;
  if (document.getElementById('settingRestName')) document.getElementById('settingRestName').value = s.restaurantName || '';
  if (document.getElementById('settingTagline')) document.getElementById('settingTagline').value = s.tagline || '';
  if (document.getElementById('settingWhatsApp')) document.getElementById('settingWhatsApp').value = s.whatsappNumber || '';
  if (document.getElementById('settingPhone')) document.getElementById('settingPhone').value = s.phone || '';
  if (document.getElementById('settingOpenTime')) document.getElementById('settingOpenTime').value = s.openTime || '';
  if (document.getElementById('settingCloseTime')) document.getElementById('settingCloseTime').value = s.closeTime || '';
  if (document.getElementById('settingCurrency')) document.getElementById('settingCurrency').value = s.currencySymbol || '₹';
  if (document.getElementById('settingGst')) document.getElementById('settingGst').value = s.gstPercentage || 5;
  if (document.getElementById('settingTableCount')) document.getElementById('settingTableCount').value = s.tableCount || 25;
  if (document.getElementById('settingAddress')) document.getElementById('settingAddress').value = s.address || '';
}

async function saveSettings(e) {
  e.preventDefault();

  const payload = {
    restaurantName: document.getElementById('settingRestName').value,
    tagline: document.getElementById('settingTagline').value,
    whatsappNumber: document.getElementById('settingWhatsApp').value,
    phone: document.getElementById('settingPhone').value,
    openTime: document.getElementById('settingOpenTime').value,
    closeTime: document.getElementById('settingCloseTime').value,
    currencySymbol: document.getElementById('settingCurrency').value,
    gstPercentage: Number(document.getElementById('settingGst').value),
    tableCount: Number(document.getElementById('settingTableCount').value),
    address: document.getElementById('settingAddress').value
  };

  adminState.settings = { ...adminState.settings, ...payload };
  showAdminToast('Restaurant settings saved successfully!', 'success');
  updateHeaderAndSidebar();

  await pushStateToFirebase();

  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

// Helpers
function populateCategoryDropdowns() {
  const itemCatSelect = document.getElementById('formItemCategory');
  const filterCatSelect = document.getElementById('adminCategoryFilter');

  if (itemCatSelect) {
    itemCatSelect.innerHTML = adminState.categories.map(c => `
      <option value="${c.id}">${c.icon || '🍽️'} ${c.name}</option>
    `).join('');
  }

  if (filterCatSelect) {
    const curr = filterCatSelect.value;
    filterCatSelect.innerHTML = '<option value="all">All Categories</option>' + adminState.categories.map(c => `
      <option value="${c.id}">${c.icon || '🍽️'} ${c.name}</option>
    `).join('');
    filterCatSelect.value = curr || 'all';
  }
}

function setupAdminListeners() {
  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value.toLowerCase().trim();
      renderMenuItems();
    });
  }

  const categoryFilter = document.getElementById('adminCategoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      adminState.categoryFilter = e.target.value;
      renderMenuItems();
    });
  }

  const dietFilter = document.getElementById('adminDietFilter');
  if (dietFilter) {
    dietFilter.addEventListener('change', (e) => {
      adminState.dietFilter = e.target.value;
      renderMenuItems();
    });
  }
}

// Toast System
function showAdminToast(message, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-circle-check text-emerald-400' :
               type === 'warning' ? 'fa-triangle-exclamation text-amber-400' :
               type === 'error' ? 'fa-circle-xmark text-rose-400' : 'fa-circle-info text-blue-400';

  toast.className = `animate-admin-toast pointer-events-auto bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold max-w-sm`;
  toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ================= CLOUD SYNC & IMGBB IMAGE UPLOADER =================

let firebaseAdminDb = null;
let firebaseAdminRtdb = null;

function initCloudSettings() {
  const savedImgbb = localStorage.getItem('lamensa_imgbb_key') || window.IMGBB_API_KEY || '';
  const savedFb = localStorage.getItem('lamensa_firebase_config') || (window.FIREBASE_CONFIG ? JSON.stringify(window.FIREBASE_CONFIG, null, 2) : '');

  const imgbbInput = document.getElementById('settingImgbbKey');
  if (imgbbInput) imgbbInput.value = savedImgbb;

  const fbInput = document.getElementById('settingFirebaseConfig');
  if (fbInput) fbInput.value = savedFb;

  setupFirebaseAdmin();
}

function setupFirebaseAdmin() {
  try {
    const rawFb = localStorage.getItem('lamensa_firebase_config');
    let cfg = null;
    if (rawFb) {
      cfg = JSON.parse(rawFb);
    } else if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
      cfg = window.FIREBASE_CONFIG;
    }

    if (window.firebase && cfg && cfg.apiKey && cfg.apiKey.trim() !== '') {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      if (cfg.databaseURL && firebase.database) {
        firebaseAdminRtdb = firebase.database().ref('menu');
        console.log('🟢 Firebase Realtime Database connected');

        // Sync admin state live with Cloud
        firebaseAdminRtdb.on('value', (snap) => {
          const val = snap.val();
          if (val && val.items && val.items.length) {
            adminState.settings = val.settings || adminState.settings;
            adminState.categories = val.categories || adminState.categories;
            adminState.items = val.items || adminState.items;
            updateHeaderAndSidebar();
            renderDashboard();
            renderMenuItems();
            renderCategories();
            populateCategoryDropdowns();
            populateTableSelectors();
            populateSettingsForm();
            generateQrCodePreview();
          }
        });
      }
      if (firebase.firestore) {
        firebaseAdminDb = firebase.firestore();
      }
      updateCloudStatusBadge(true);
    } else {
      updateCloudStatusBadge(false);
    }
  } catch (err) {
    console.warn('Firebase Admin setup failed:', err);
    updateCloudStatusBadge(false);
  }
}

function updateCloudStatusBadge(isConnected = false) {
  const badge = document.getElementById('cloudStatusBadge');
  if (!badge) return;
  if (isConnected) {
    badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    badge.textContent = '🟢 Firebase Connected';
  } else {
    badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700';
    badge.textContent = '⚪ Local Express Mode';
  }
}

function saveCloudSettings() {
  const imgbbKey = document.getElementById('settingImgbbKey').value.trim();
  const fbConfigRaw = document.getElementById('settingFirebaseConfig').value.trim();

  localStorage.setItem('lamensa_imgbb_key', imgbbKey);
  window.IMGBB_API_KEY = imgbbKey;

  if (fbConfigRaw) {
    try {
      const parsed = JSON.parse(fbConfigRaw);
      localStorage.setItem('lamensa_firebase_config', JSON.stringify(parsed));
      window.FIREBASE_CONFIG = parsed;
      setupFirebaseAdmin();
      showAdminToast('Cloud settings saved successfully!', 'success');
    } catch (e) {
      showAdminToast('Invalid JSON in Firebase configuration. Please check format.', 'error');
      return;
    }
  } else {
    localStorage.removeItem('lamensa_firebase_config');
    updateCloudStatusBadge(false);
    showAdminToast('Cloud settings updated', 'info');
  }
}

// 1-Click Sync Current Menu to Firebase
async function syncLocalToFirebase() {
  const btn = document.getElementById('btnSyncFirebase');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Syncing...';

  try {
    await pushStateToFirebase();
    showAdminToast(`Synced all ${adminState.items.length} items & ${adminState.categories.length} categories to Firebase!`, 'success');
  } catch (err) {
    console.error('Sync failed:', err);
    showAdminToast('Error syncing to Firebase: ' + err.message, 'error');
  } finally {
    if (btn) btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> 1-Click Sync to Firebase';
  }
}

// Push State to Firebase (Direct Realtime Database + REST Backup)
async function pushStateToFirebase() {
  const payload = {
    settings: adminState.settings,
    categories: adminState.categories,
    items: adminState.items,
    updatedAt: new Date().toISOString()
  };

  let pushed = false;

  // 1. Direct Realtime Database SDK
  if (firebaseAdminRtdb) {
    try {
      await firebaseAdminRtdb.set(payload);
      pushed = true;
      console.log('⚡ Firebase RTDB SDK updated successfully');
    } catch (err) {
      console.warn('RTDB SDK write failed, trying REST:', err);
    }
  }

  // 2. Direct REST Backup (Works everywhere without SDK auth hurdles)
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && cfg.databaseURL) {
    try {
      const restRes = await fetch(`${cfg.databaseURL}/menu.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (restRes.ok) {
        pushed = true;
        console.log('⚡ Firebase RTDB REST updated successfully');
      }
    } catch (e) {
      console.warn('REST push error:', e);
    }
  }

  if (firebaseAdminDb) {
    try {
      await firebaseAdminDb.collection("restaurant").doc("menu").set(payload);
    } catch (e) {}
  }

  return pushed;
}

// Compatibility alias
async function pushStateToFirebaseIfAvailable() {
  return pushStateToFirebase();
}

// Handle Image File Upload (Auto Canvas Compression + ImgBB API)
async function handleImageFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('imgUploadStatus');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewThumb = document.getElementById('imagePreviewThumb');
  const imgInput = document.getElementById('formItemImage');

  const imgbbKey = localStorage.getItem('lamensa_imgbb_key') || window.IMGBB_API_KEY;

  if (!imgbbKey) {
    showAdminToast('Please enter ImgBB API Key in Restaurant Settings first!', 'warning');
    if (statusEl) statusEl.textContent = 'ImgBB Key missing';
    return;
  }

  if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Compressing...';

  try {
    // 1. Client-Side Canvas Compression (Converts 6MB to ~150KB)
    const compressedBlob = await compressImageFile(file, 1000, 0.82);

    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-cloud-arrow-up animate-pulse"></i> Uploading...';

    // 2. Upload to ImgBB
    const formData = new FormData();
    formData.append('image', compressedBlob, (file.name || 'dish').replace(/\.[^/.]+$/, "") + '.jpg');

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      const cdnUrl = data.data.display_url || data.data.url;
      imgInput.value = cdnUrl;

      if (previewThumb) previewThumb.src = cdnUrl;
      if (previewContainer) previewContainer.classList.remove('hidden');
      if (statusEl) statusEl.innerHTML = '<span class="text-emerald-400">✓ Uploaded</span>';
      showAdminToast('Photo compressed & uploaded to ImgBB!', 'success');
    } else {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }
  } catch (err) {
    console.error('Image upload error:', err);
    if (statusEl) statusEl.innerHTML = '<span class="text-rose-400">Failed</span>';
    showAdminToast('Image upload failed: ' + err.message, 'error');
  }
}

// Client-Side Canvas Image Compression Helper
function compressImageFile(file, maxDimension = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas compression failed'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
