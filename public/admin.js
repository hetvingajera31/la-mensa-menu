// Admin Application State (Synchronized with Firebase Cloud)
const adminState = {
  settings: {},
  categories: [],
  items: [],
  activeTab: 'dishes',
  searchQuery: '',
  categoryFilter: 'all',
  stockFilter: 'all',
  dietFilter: 'all',
  quickFilters: [
    { id: 'all', name: 'All Dishes', desc: 'Shows the complete menu and clears any filter.', alwaysShown: true },
    { id: 'veg', name: '100% Veg', desc: 'Shows vegetarian dishes.' },
    { id: 'jain', name: 'Jain Available', desc: 'Shows dishes that can be prepared Jain style.' },
    { id: 'special', name: "Chef's Specials", desc: 'Shows the chef-recommended dishes.' },
    { id: 'bestseller', name: 'Bestsellers', desc: 'Shows the most popular dishes.' },
    { id: 'beverages', name: 'Mocktails & Beverages', desc: 'Shows drinks and refreshers.' },
    { id: 'desserts', name: 'Desserts', desc: 'Shows sweet dishes and ice creams.' }
  ],
  customDishOptions: ['Tangy'],
  frontPageCards: [
    { id: 'contact', title: 'Contact Card', badge: 'CONTACT', shown: true, url: '#visit', image: '' },
    { id: 'maps', title: 'Google Maps', badge: 'MAPS', shown: true, url: 'https://goo.gl/maps/BPHVUQhLn2WfJgUg7', image: '' },
    { id: 'menu', title: 'Menu', badge: 'MENU', shown: true, url: '/menu', image: '' },
    { id: 'instagram', title: 'Instagram', badge: 'INSTAGRAM', shown: true, url: 'https://www.instagram.com/lamensa_multicuisine', image: '' },
    { id: 'mail', title: 'Mail', badge: 'EMAIL', shown: true, url: 'mailto:lamensasurat@gmail.com', image: '' },
    { id: 'review', title: 'Review Us', badge: 'REVIEW', shown: true, url: 'https://g.page/r/review', image: '' },
    { id: 'whatsapp', title: 'WhatsApp', badge: 'WHATSAPP', shown: true, url: 'https://wa.me/919875281816', image: '' },
    { id: 'call', title: 'Call', badge: 'CALL', shown: true, url: 'tel:+919875281816', image: '' }
  ]
};

let firebaseAdminRtdb = null;
const DEFAULT_ADMIN_PASS = 'lamensagroup';

// Check Admin Authentication on Load
function checkAdminAuth() {
  const isAuthed = sessionStorage.getItem('lamensa_admin_auth') === 'true';
  const lockScreen = document.getElementById('adminLockScreen');
  if (!lockScreen) return;
  if (isAuthed) {
    lockScreen.classList.add('hidden');
  } else {
    lockScreen.classList.remove('hidden');
    const passInput = document.getElementById('adminPasswordInput');
    if (passInput) {
      passInput.value = '';
      setTimeout(() => passInput.focus(), 150);
    }
  }
}

// Handle Admin Unlock Submit
function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const passInput = document.getElementById('adminPasswordInput');
  const errEl = document.getElementById('adminLoginError');
  const entered = (passInput ? passInput.value : '').trim();

  const customPass = adminState.settings && adminState.settings.adminPassword;
  if (entered === DEFAULT_ADMIN_PASS || (customPass && entered === customPass)) {
    sessionStorage.setItem('lamensa_admin_auth', 'true');
    if (errEl) errEl.classList.add('hidden');
    const lockScreen = document.getElementById('adminLockScreen');
    if (lockScreen) lockScreen.classList.add('hidden');
    showAdminToast('Dashboard Unlocked. Welcome!', 'success');
  } else {
    if (errEl) {
      errEl.textContent = 'Incorrect password. Please try again.';
      errEl.classList.remove('hidden');
    }
    if (passInput) {
      passInput.classList.add('border-rose-500');
      setTimeout(() => passInput.classList.remove('border-rose-500'), 1500);
      passInput.focus();
    }
  }
}

// Initialize Admin on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  fetchAdminData();
  setupEventListeners();
  initFirebaseLiveListener();
});

// 1. Fetch Full Dataset from Firebase Cloud Priority 1
async function fetchAdminData() {
  const cfg = window.FIREBASE_CONFIG;
  let loaded = false;

  if (cfg && cfg.databaseURL) {
    try {
      const fbRes = await fetch(`${cfg.databaseURL}/menu.json?t=${Date.now()}`);
      const cloudData = await fbRes.json();
      if (cloudData && cloudData.items && cloudData.items.length) {
        adminState.settings = cloudData.settings || {};
        adminState.categories = cloudData.categories || [];
        adminState.items = cloudData.items || [];
        if (cloudData.quickFilters && cloudData.quickFilters.length) adminState.quickFilters = cloudData.quickFilters;
        if (cloudData.customDishOptions) adminState.customDishOptions = cloudData.customDishOptions;
        if (cloudData.frontPageCards && cloudData.frontPageCards.length) adminState.frontPageCards = cloudData.frontPageCards;
        loaded = true;
        console.log('⚡ Loaded directly from Firebase Cloud:', adminState.items.length, 'items');
      }
    } catch (e) {
      console.warn('Firebase direct load error:', e);
    }
  }

  // Fallback to Express backend if needed
  if (!loaded) {
    try {
      const res = await fetch('/api/data?t=' + Date.now());
      const data = await res.json();
      if (data && data.success && data.data) {
        adminState.settings = data.data.settings || {};
        adminState.categories = data.data.categories || [];
        adminState.items = data.data.items || [];
      }
    } catch (apiErr) {
      console.warn('Local API load error:', apiErr);
    }
  }

  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();
  populateCategoryDropdowns();
  populateProfileForm();
  populateFrontPageForm();
}

// Live Firebase RTDB connection listener
function initFirebaseLiveListener() {
  const cfg = window.FIREBASE_CONFIG;
  if (window.firebase && cfg && cfg.apiKey) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      if (cfg.databaseURL && firebase.database) {
        firebaseAdminRtdb = firebase.database().ref('menu');
        firebaseAdminRtdb.on('value', (snap) => {
          const cloudData = snap.val();
          if (cloudData && cloudData.items && cloudData.items.length) {
            adminState.settings = cloudData.settings || adminState.settings;
            adminState.categories = cloudData.categories || adminState.categories;
            adminState.items = cloudData.items || adminState.items;
            if (cloudData.quickFilters) adminState.quickFilters = cloudData.quickFilters;
            if (cloudData.customDishOptions) adminState.customDishOptions = cloudData.customDishOptions;
            if (cloudData.frontPageCards) adminState.frontPageCards = cloudData.frontPageCards;
            
            updateMetrics();
            renderDishesTable();
            renderCategoriesGrid();
            populateCategoryDropdowns();
          }
        });
      }
    } catch (err) {
      console.warn('Firebase live listener init warning:', err);
    }
  }
}

// Push State to Firebase Cloud
async function pushStateToFirebase() {
  const payload = {
    settings: adminState.settings,
    categories: adminState.categories,
    items: adminState.items,
    quickFilters: adminState.quickFilters,
    customDishOptions: adminState.customDishOptions,
    frontPageCards: adminState.frontPageCards,
    updatedAt: new Date().toISOString()
  };

  const cfg = window.FIREBASE_CONFIG;
  let pushed = false;

  // 1. Direct REST PUT to Firebase RTDB
  if (cfg && cfg.databaseURL) {
    try {
      const restRes = await fetch(`${cfg.databaseURL}/menu.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (restRes.ok) pushed = true;
    } catch (e) {
      console.warn('REST push error:', e);
    }
  }

  // 2. Firebase SDK fallback
  if (firebaseAdminRtdb) {
    try {
      await firebaseAdminRtdb.set(payload);
      pushed = true;
    } catch (e) {}
  }

  // 3. Background server sync
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminState.settings)
  }).catch(() => {});

  return pushed;
}

// 2. Update Top 4 Metric Cards
function updateMetrics() {
  const total = adminState.items.length;
  const inStock = adminState.items.filter(i => i.isAvailable !== false).length;
  const soldOut = total - inStock;
  const chefSpecials = adminState.items.filter(i => i.isChefSpecial).length;
  const totalCats = adminState.categories.length;

  document.getElementById('adminStatTotalDishes').textContent = total;
  document.getElementById('adminStatTotalCats').textContent = `${totalCats} Categories`;
  document.getElementById('adminStatInStock').textContent = inStock;
  document.getElementById('adminStatSoldOut').textContent = soldOut;
  document.getElementById('adminStatChefSpecials').textContent = chefSpecials;

  document.getElementById('tabDishesCount').textContent = total;
  document.getElementById('tabCatsCount').textContent = totalCats;
}

// 3. Tab Switching
function switchAdminTab(tabId) {
  adminState.activeTab = tabId;

  // Update tab buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`adminTabBtn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update panes
  document.querySelectorAll('.admin-pane').forEach(pane => pane.classList.add('hidden'));
  const activePane = document.getElementById(`adminPane-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');

  // Trigger relevant renders
  if (tabId === 'dishes') renderDishesTable();
  if (tabId === 'categories') renderCategoriesGrid();
  if (tabId === 'profile') populateProfileForm();
  if (tabId === 'frontpage') populateFrontPageForm();
}

// 4. TAB 1: MANAGE DISHES (Screenshot 5)
function renderDishesTable() {
  const tbody = document.getElementById('dishesTableBody');
  const emptyState = document.getElementById('dishesEmptyState');
  if (!tbody) return;

  const currency = adminState.settings.currencySymbol || '₹';

  // Filter items
  let filtered = adminState.items.filter(item => {
    // Search query
    if (adminState.searchQuery) {
      const q = adminState.searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Category filter
    if (adminState.categoryFilter !== 'all' && item.categoryId !== adminState.categoryFilter) {
      return false;
    }

    // Stock filter
    const isAvail = item.isAvailable !== false;
    if (adminState.stockFilter === 'instock' && !isAvail) return false;
    if (adminState.stockFilter === 'soldout' && isAvail) return false;

    // Dietary filter
    if (adminState.dietFilter === 'jain' && !item.isJain) return false;
    if (adminState.dietFilter === 'special' && !item.isChefSpecial) return false;
    if (adminState.dietFilter === 'bestseller' && !item.isBestseller) return false;

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  tbody.innerHTML = filtered.map(item => {
    const isAvailable = item.isAvailable !== false;
    const catObj = adminState.categories.find(c => c.id === item.categoryId);
    const catName = catObj ? catObj.name : 'General';

    return `
      <tr class="hover:bg-[#fbfaf6] transition">
        <!-- Dish Name & Info -->
        <td class="py-3.5 px-4 sm:px-6">
          <div class="flex items-start gap-3">
            <span class="veg-indicator mt-0.5" title="Pure Veg"></span>
            <div>
              <div class="font-bold text-sm text-[#0d2d24] leading-snug">
                ${item.name}
              </div>
              <div class="text-[11px] text-stone-500 mt-0.5 line-clamp-1 max-w-sm">
                ${item.description || 'Artisanal recipe prepared fresh.'}
              </div>
              <div class="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                <span><i class="fa-solid fa-plate-wheat text-[#dfb15b]"></i> ${item.portion || 'Serves 1-2'}</span>
                <span>•</span>
                <span><i class="fa-regular fa-clock text-[#dfb15b]"></i> ${item.prepTime || '15 mins'}</span>
              </div>
            </div>
          </div>
        </td>

        <!-- Category -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full bg-[#f7f5ef] border border-[#e6e2d6] text-[11px] font-semibold text-stone-700">
            ${catName}
          </span>
        </td>

        <!-- Price -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="font-extrabold text-[#0d2d24] text-sm">
            ${currency}${item.price}
          </div>
          ${item.originalPrice ? `
            <span class="text-[10px] text-stone-400 line-through">
              ${currency}${item.originalPrice}
            </span>
          ` : ''}
        </td>

        <!-- Tags / Badges -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-1.5 flex-wrap max-w-xs">
            ${item.isChefSpecial ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdaa9] text-[#0d2d24] border border-[#dfb15b]">
                ⭐ Chef's Special
              </span>
            ` : ''}
            ${item.isJain ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                🟡 Jain Option
              </span>
            ` : ''}
            ${item.isBestseller ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                Popular
              </span>
            ` : ''}
            ${item.isSpicy || item.spiceLevel >= 2 ? `
              <span class="text-[10px] font-bold text-rose-600">🌶️ Spicy</span>
            ` : ''}
          </div>
        </td>

        <!-- Stock Status Toggle Button -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <button onclick="toggleItemStock('${item.id}')" title="Click to toggle availability" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 shadow-xs' : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 shadow-xs'}">
            <span class="w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}"></span>
            <span>${isAvailable ? 'In Stock' : 'Sold Out'}</span>
          </button>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openEditDishModal('${item.id}')" title="Edit Dish" class="w-8 h-8 rounded-xl bg-[#f7f5ef] hover:bg-[#ffdaa9] text-stone-700 hover:text-[#0d2d24] flex items-center justify-center transition border border-[#e6e2d6]">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button onclick="deleteDish('${item.id}', '${item.name.replace(/'/g, "\\'")}')" title="Delete Dish" class="w-8 h-8 rounded-xl bg-[#f7f5ef] hover:bg-rose-100 text-stone-700 hover:text-rose-600 flex items-center justify-center transition border border-[#e6e2d6]">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Stock Instant Action
async function toggleItemStock(itemId) {
  const item = adminState.items.find(i => i.id === itemId);
  if (!item) return;

  item.isAvailable = item.isAvailable === false ? true : false;
  showAdminToast(`"${item.name}" marked as ${item.isAvailable ? 'In Stock' : 'Sold Out'}!`, item.isAvailable ? 'success' : 'warning');
  
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();

  await pushStateToFirebase();
}

// Render Core and Dynamic Custom Dish Options inside Add/Edit Dish Modal
function renderDishModalOptions(item) {
  const container = document.getElementById('dishModalOptionsContainer');
  if (!container) return;

  const isAvailable = item ? (item.isAvailable !== false) : true;
  const isJain = item ? Boolean(item.isJain) : false;
  const isSpecial = item ? Boolean(item.isChefSpecial) : false;
  const isBestseller = item ? Boolean(item.isBestseller) : false;
  const customOpts = (item && Array.isArray(item.customOptions)) ? item.customOptions : [];

  let html = `
    <label class="flex items-center gap-2 p-2 rounded-xl bg-[#faf9f5] border border-[#e6e2d6] cursor-pointer hover:border-[#dfb15b] transition">
      <input type="checkbox" id="dishFormIsAvailable" ${isAvailable ? 'checked' : ''} class="rounded text-[#0d2d24]" />
      <span class="font-bold text-emerald-800 text-xs">In Stock</span>
    </label>
    <label class="flex items-center gap-2 p-2 rounded-xl bg-[#faf9f5] border border-[#e6e2d6] cursor-pointer hover:border-[#dfb15b] transition">
      <input type="checkbox" id="dishFormIsJain" ${isJain ? 'checked' : ''} class="rounded text-[#0d2d24]" />
      <span class="font-semibold text-amber-900 text-xs">Jain Available</span>
    </label>
    <label class="flex items-center gap-2 p-2 rounded-xl bg-[#faf9f5] border border-[#e6e2d6] cursor-pointer hover:border-[#dfb15b] transition">
      <input type="checkbox" id="dishFormIsSpecial" ${isSpecial ? 'checked' : ''} class="rounded text-[#0d2d24]" />
      <span class="font-semibold text-[#0d2d24] text-xs">Chef's Special</span>
    </label>
    <label class="flex items-center gap-2 p-2 rounded-xl bg-[#faf9f5] border border-[#e6e2d6] cursor-pointer hover:border-[#dfb15b] transition">
      <input type="checkbox" id="dishFormIsBestseller" ${isBestseller ? 'checked' : ''} class="rounded text-[#0d2d24]" />
      <span class="font-semibold text-emerald-800 text-xs">Popular</span>
    </label>
  `;

  // Dynamically append options from adminState.customDishOptions
  if (adminState.customDishOptions && Array.isArray(adminState.customDishOptions)) {
    adminState.customDishOptions.forEach(opt => {
      const isChecked = customOpts.includes(opt);
      html += `
        <label class="flex items-center gap-2 p-2 rounded-xl bg-[#faf9f5] border border-[#e6e2d6] cursor-pointer hover:border-[#dfb15b] transition">
          <input type="checkbox" data-custom-opt="${opt}" class="dish-custom-opt-cb rounded text-[#0d2d24]" ${isChecked ? 'checked' : ''} />
          <span class="font-semibold text-[#0d2d24] text-xs truncate" title="${opt}">${opt}</span>
        </label>
      `;
    });
  }

  container.innerHTML = html;
}

// Open Add Dish Modal
function openAddDishModal() {
  document.getElementById('dishModalTitle').textContent = 'Add New Dish';
  document.getElementById('dishFormId').value = '';
  document.getElementById('dishForm').reset();
  renderDishModalOptions(null);
  document.getElementById('dishImageUploadStatus').textContent = '';
  document.getElementById('dishModal').classList.remove('hidden');
}

// Open Edit Dish Modal
function openEditDishModal(itemId) {
  const item = adminState.items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('dishModalTitle').textContent = 'Edit Dish Details';
  document.getElementById('dishFormId').value = item.id;
  document.getElementById('dishFormName').value = item.name;
  document.getElementById('dishFormCategory').value = item.categoryId;
  document.getElementById('dishFormPrice').value = item.price;
  document.getElementById('dishFormOrigPrice').value = item.originalPrice || '';
  document.getElementById('dishFormPortion').value = item.portion || '';
  document.getElementById('dishFormPrepTime').value = item.prepTime || '';
  document.getElementById('dishFormImage').value = item.image || '';
  document.getElementById('dishFormDesc').value = item.description || '';
  renderDishModalOptions(item);
  document.getElementById('dishImageUploadStatus').textContent = '';
  
  document.getElementById('dishModal').classList.remove('hidden');
}

function closeDishModal() {
  document.getElementById('dishModal').classList.add('hidden');
}

async function saveDish(e) {
  e.preventDefault();
  const id = document.getElementById('dishFormId').value;
  const selectedCustomOptions = Array.from(document.querySelectorAll('.dish-custom-opt-cb:checked')).map(cb => cb.dataset.customOpt);

  const isAvailEl = document.getElementById('dishFormIsAvailable');
  const isJainEl = document.getElementById('dishFormIsJain');
  const isSpecialEl = document.getElementById('dishFormIsSpecial');
  const isBestsellerEl = document.getElementById('dishFormIsBestseller');

  const payload = {
    id: id || ('item-' + Date.now()),
    name: document.getElementById('dishFormName').value.trim(),
    categoryId: document.getElementById('dishFormCategory').value,
    price: Number(document.getElementById('dishFormPrice').value),
    originalPrice: document.getElementById('dishFormOrigPrice').value ? Number(document.getElementById('dishFormOrigPrice').value) : null,
    portion: document.getElementById('dishFormPortion').value.trim() || 'Serves 1-2',
    prepTime: document.getElementById('dishFormPrepTime').value.trim() || '15 mins',
    image: document.getElementById('dishFormImage').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: document.getElementById('dishFormDesc').value.trim(),
    isVeg: true,
    isAvailable: isAvailEl ? isAvailEl.checked : true,
    isJain: isJainEl ? isJainEl.checked : false,
    isChefSpecial: isSpecialEl ? isSpecialEl.checked : false,
    isBestseller: isBestsellerEl ? isBestsellerEl.checked : false,
    customOptions: selectedCustomOptions
  };

  if (id) {
    const idx = adminState.items.findIndex(i => i.id === id);
    if (idx !== -1) adminState.items[idx] = { ...adminState.items[idx], ...payload };
  } else {
    adminState.items.unshift(payload);
  }

  closeDishModal();
  showAdminToast(id ? 'Dish updated successfully' : 'New dish added', 'success');
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();

  await pushStateToFirebase();
}

async function deleteDish(itemId, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  adminState.items = adminState.items.filter(i => i.id !== itemId);
  showAdminToast(`"${name}" deleted`, 'info');
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();

  await pushStateToFirebase();
}

// 5. TAB 2: CATEGORIES MANAGEMENT (Screenshot 1)
function renderCategoriesGrid() {
  const container = document.getElementById('categoriesGridContainer');
  if (!container) return;

  container.innerHTML = adminState.categories.map((cat, index) => {
    const totalInCat = adminState.items.filter(i => i.categoryId === cat.id).length;
    const soldOutInCat = adminState.items.filter(i => i.categoryId === cat.id && i.isAvailable === false).length;

    return `
      <div class="bg-white rounded-2xl p-4 border border-[#e6e2d6] shadow-xs flex items-center justify-between gap-3 hover:border-[#dfb15b] transition">
        
        <!-- Left: Index + Name & Counts -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
            ${index + 1}
          </div>
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-[#0d2d24] truncate">
              ${cat.name}
            </h4>
            <div class="text-[11px] text-stone-500 mt-0.5 truncate">
              Section • <strong class="text-emerald-700">${totalInCat} dishes</strong>
              ${soldOutInCat > 0 ? `<span class="text-rose-600 font-semibold ml-1.5">• ${soldOutInCat} Sold Out</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Move Controls [Input] [Move] [↑] [↓], Shown Badge, Edit, Delete -->
        <div class="flex items-center gap-1.5 shrink-0">
          
          <!-- Move Order Box [ Number Input ] [ Move Button ] [ ↑ ] [ ↓ ] (Matches Screenshot media_1791288676413.png) -->
          <div class="flex items-center gap-1 bg-[#f7f5ef] border border-[#e6e2d6] rounded-xl p-1 text-xs">
            <input
              type="number"
              id="catPosInput-${cat.id}"
              value="${index + 1}"
              min="1"
              max="${adminState.categories.length}"
              class="w-9 h-7 text-center font-bold text-xs text-[#0d2d24] bg-white border border-[#dcd7c9] rounded-lg outline-none focus:border-[#dfb15b]"
              onkeydown="if(event.key==='Enter'){event.preventDefault(); handleCategoryMoveInput('${cat.id}');}"
            />
            <button
              onclick="handleCategoryMoveInput('${cat.id}')"
              title="Move category to this position"
              class="px-2 py-1 rounded-lg bg-[#0d2d24] hover:bg-[#153f33] text-[#ffdaa9] font-bold text-[10px] transition shadow-xs"
            >
              Move
            </button>
            <button onclick="moveCategory('${cat.id}', -1)" title="Move up" class="p-1 hover:text-[#0d2d24] text-stone-500">
              <i class="fa-solid fa-arrow-up text-[10px]"></i>
            </button>
            <button onclick="moveCategory('${cat.id}', 1)" title="Move down" class="p-1 hover:text-[#0d2d24] text-stone-500">
              <i class="fa-solid fa-arrow-down text-[10px]"></i>
            </button>
          </div>

          <!-- Shown Pill -->
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold hidden sm:inline-block">
            👁️ Shown
          </span>

          <!-- Edit Button -->
          <button onclick="openEditCategoryModal('${cat.id}')" title="Edit Category" class="w-8 h-8 rounded-xl bg-[#f7f5ef] hover:bg-[#ffdaa9] text-stone-700 hover:text-[#0d2d24] flex items-center justify-center transition border border-[#e6e2d6]">
            <i class="fa-solid fa-pen-to-square text-xs"></i>
          </button>

          <!-- Delete Button -->
          <button onclick="deleteCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', ${totalInCat})" title="Delete Category" class="w-8 h-8 rounded-xl bg-[#f7f5ef] hover:bg-rose-100 text-stone-700 hover:text-rose-600 flex items-center justify-center transition border border-[#e6e2d6]">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>

        </div>

      </div>
    `;
  }).join('');
}

// Handle Move Category Input from card
function handleCategoryMoveInput(catId) {
  const inputEl = document.getElementById(`catPosInput-${catId}`);
  if (!inputEl) return;
  const targetPos = parseInt(inputEl.value, 10);
  if (isNaN(targetPos)) return;
  moveCategoryToPosition(catId, targetPos);
}

// Move Category to specific 1-based index (e.g. typing 5 moves it to 5th position)
async function moveCategoryToPosition(catId, targetPos) {
  const curIdx = adminState.categories.findIndex(c => c.id === catId);
  if (curIdx === -1) return;

  let targetIdx = targetPos - 1;
  if (targetIdx < 0) targetIdx = 0;
  if (targetIdx >= adminState.categories.length) targetIdx = adminState.categories.length - 1;

  if (curIdx === targetIdx) return;

  const [movedCat] = adminState.categories.splice(curIdx, 1);
  adminState.categories.splice(targetIdx, 0, movedCat);

  renderCategoriesGrid();
  populateCategoryDropdowns();
  showAdminToast(`"${movedCat.name}" moved to position ${targetIdx + 1}!`, 'success');
  await pushStateToFirebase();
}

// Move Category Order (Up/Down step)
async function moveCategory(catId, delta) {
  const idx = adminState.categories.findIndex(c => c.id === catId);
  if (idx === -1) return;

  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= adminState.categories.length) return;

  // Swap
  const temp = adminState.categories[idx];
  adminState.categories[idx] = adminState.categories[targetIdx];
  adminState.categories[targetIdx] = temp;

  renderCategoriesGrid();
  populateCategoryDropdowns();
  await pushStateToFirebase();
}

function openAddCategoryModal() {
  document.getElementById('categoryModalTitle').textContent = 'Add Category';
  document.getElementById('catFormId').value = '';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryModal').classList.remove('hidden');
}

function openEditCategoryModal(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  document.getElementById('catFormId').value = cat.id;
  document.getElementById('catFormName').value = cat.name;
  document.getElementById('catFormIcon').value = cat.icon || '';
  document.getElementById('catFormDesc').value = cat.subtitle || cat.description || '';
  document.getElementById('categoryModal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('catFormId').value;
  const payload = {
    name: document.getElementById('catFormName').value.trim(),
    icon: document.getElementById('catFormIcon').value.trim() || '🍽️',
    description: document.getElementById('catFormDesc').value.trim(),
    subtitle: document.getElementById('catFormDesc').value.trim()
  };

  if (id) {
    const cat = adminState.categories.find(c => c.id === id);
    if (cat) Object.assign(cat, payload);
  } else {
    adminState.categories.push({
      id: 'cat-' + Date.now(),
      ...payload
    });
  }

  closeCategoryModal();
  showAdminToast(id ? 'Category updated' : 'Category added', 'success');
  updateMetrics();
  renderCategoriesGrid();
  populateCategoryDropdowns();

  await pushStateToFirebase();
}

async function deleteCategory(catId, name, itemCount) {
  if (itemCount > 0) {
    alert(`Cannot delete category "${name}" because it contains ${itemCount} dishes. Please reassign or delete dishes first.`);
    return;
  }
  if (!confirm(`Delete category "${name}"?`)) return;

  adminState.categories = adminState.categories.filter(c => c.id !== catId);
  showAdminToast(`Category "${name}" deleted`, 'info');
  updateMetrics();
  renderCategoriesGrid();
  populateCategoryDropdowns();

  await pushStateToFirebase();
}

// 6. TAB 3: RESTAURANT PROFILE & WHATSAPP (Screenshot 2)
function populateProfileForm() {
  const s = adminState.settings;
  if (document.getElementById('profLogoUrl')) document.getElementById('profLogoUrl').value = s.logoUrl || '';
  updateAdminLogoUI(s.logoUrl);

  if (document.getElementById('profRestName')) document.getElementById('profRestName').value = s.restaurantName || 'LA MENSA';
  if (document.getElementById('profSubtitle')) document.getElementById('profSubtitle').value = s.subtitle || 'MULTI CUISINE';
  if (document.getElementById('profTagline')) document.getElementById('profTagline').value = s.tagline || 'There is no sincerer love than the love of food.';
  if (document.getElementById('profWhatsApp')) document.getElementById('profWhatsApp').value = s.whatsappNumber || '+91 7567267890';
  if (document.getElementById('profPhone')) document.getElementById('profPhone').value = s.phone || '+91 7567267890';
  if (document.getElementById('profAddress')) document.getElementById('profAddress').value = s.address || 'Ramkatha Road, Beside Gunjan Park, Near SRK Sports Complex, Katargam, Surat, Gujarat';
  if (document.getElementById('profTimings')) document.getElementById('profTimings').value = s.timings || '11:00 AM - 11:00 PM (All Days)';
  if (document.getElementById('profGst')) document.getElementById('profGst').value = s.gstPercentage || 5;
  if (document.getElementById('profWifiName')) document.getElementById('profWifiName').value = s.wifiName || 'LaMensa_Guest';
  if (document.getElementById('profWifiPass')) document.getElementById('profWifiPass').value = s.wifiPassword || 'goodfoodbettervibes';
  if (document.getElementById('profAnnouncement')) document.getElementById('profAnnouncement').value = s.announcement || '✨ Welcome to La Mensa! Freshly prepared artisanal multi-cuisine delicacies. No artificial food colors or MSG.';

  renderQuickFiltersList();
  renderCustomTags();
}

function renderQuickFiltersList() {
  const container = document.getElementById('quickFiltersListContainer');
  if (!container) return;

  document.getElementById('quickFilterCountBadge').textContent = `${adminState.quickFilters.length} visible`;

  container.innerHTML = adminState.quickFilters.map((f, idx) => `
    <div class="bg-white p-3 rounded-xl border border-[#e6e2d6] flex items-center justify-between gap-3 text-xs">
      <div>
        <span class="font-bold text-[#0d2d24]">${f.name}</span>
        <p class="text-[11px] text-stone-500">${f.desc}</p>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" onclick="moveQuickFilter(${idx}, -1)" title="Move up" class="p-1 rounded text-stone-400 hover:text-stone-700">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <button type="button" onclick="moveQuickFilter(${idx}, 1)" title="Move down" class="p-1 rounded text-stone-400 hover:text-stone-700">
          <i class="fa-solid fa-angle-right"></i>
        </button>
        ${f.alwaysShown ? `
          <span class="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">Always shown</span>
        ` : `
          <button type="button" onclick="removeQuickFilter(${idx})" class="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
            Remove
          </button>
        `}
      </div>
    </div>
  `).join('');
}

function moveQuickFilter(idx, delta) {
  const target = idx + delta;
  if (target < 0 || target >= adminState.quickFilters.length) return;
  const temp = adminState.quickFilters[idx];
  adminState.quickFilters[idx] = adminState.quickFilters[target];
  adminState.quickFilters[target] = temp;
  renderQuickFiltersList();
}

function removeQuickFilter(idx) {
  adminState.quickFilters.splice(idx, 1);
  renderQuickFiltersList();
}

function addQuickFilter() {
  const sel = document.getElementById('addQuickFilterSelect');
  const val = sel.value;
  if (!val) return;
  if (adminState.quickFilters.some(f => f.name === val)) {
    showAdminToast('Filter already in list', 'info');
    return;
  }
  adminState.quickFilters.push({
    id: val.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: val,
    desc: `Shows ${val} dishes.`
  });
  renderQuickFiltersList();
  sel.value = '';
}

function renderCustomTags() {
  const container = document.getElementById('customDishTagsContainer');
  if (!container) return;
  document.getElementById('customTagsCountBadge').textContent = `${adminState.customDishOptions.length}/12`;

  container.innerHTML = adminState.customDishOptions.map(tag => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#dcd7c9] text-xs font-semibold text-stone-700 shadow-xs">
      <span>${tag}</span>
      <button type="button" onclick="removeCustomTag('${tag}')" class="text-stone-400 hover:text-rose-600 font-bold ml-0.5">×</button>
    </span>
  `).join('');
}

async function addCustomTag() {
  const input = document.getElementById('newCustomTagInput');
  const val = input.value.trim();
  if (!val) return;
  if (adminState.customDishOptions.includes(val)) return;
  adminState.customDishOptions.push(val);
  input.value = '';
  renderCustomTags();
  await pushStateToFirebase();
  showAdminToast(`Custom option "${val}" added!`, 'success');
}

async function removeCustomTag(tag) {
  adminState.customDishOptions = adminState.customDishOptions.filter(t => t !== tag);
  renderCustomTags();
  await pushStateToFirebase();
  showAdminToast(`Custom option "${tag}" removed.`, 'info');
}

async function saveProfileSettings(e) {
  e.preventDefault();

  if (document.getElementById('profLogoUrl')) {
    adminState.settings.logoUrl = document.getElementById('profLogoUrl').value.trim();
    updateAdminLogoUI(adminState.settings.logoUrl);
  }

  adminState.settings.restaurantName = document.getElementById('profRestName').value.trim();
  adminState.settings.subtitle = document.getElementById('profSubtitle').value.trim();
  adminState.settings.tagline = document.getElementById('profTagline').value.trim();
  adminState.settings.whatsappNumber = document.getElementById('profWhatsApp').value.trim();
  adminState.settings.phone = document.getElementById('profPhone').value.trim();
  adminState.settings.address = document.getElementById('profAddress').value.trim();
  adminState.settings.timings = document.getElementById('profTimings').value.trim();
  adminState.settings.gstPercentage = Number(document.getElementById('profGst').value) || 5;
  adminState.settings.wifiName = document.getElementById('profWifiName').value.trim();
  adminState.settings.wifiPassword = document.getElementById('profWifiPass').value.trim();
  adminState.settings.announcement = document.getElementById('profAnnouncement').value.trim();

  const newPass = document.getElementById('profPassword') ? document.getElementById('profPassword').value.trim() : '';
  if (newPass && newPass.length >= 6) {
    adminState.settings.adminPassword = newPass;
    showAdminToast('Admin password updated successfully!', 'info');
  }

  await pushStateToFirebase();
  showAdminToast('Restaurant profile & logo saved to cloud!', 'success');
}

// 7. TAB 4: MANAGE FRONT PAGE (Screenshot 4)
function populateFrontPageForm() {
  const s = adminState.settings;
  if (document.getElementById('fpProfileImg')) document.getElementById('fpProfileImg').value = s.profileImgUrl || '';
  if (document.getElementById('fpBgImg')) document.getElementById('fpBgImg').value = s.bgImgUrl || '';
  if (document.getElementById('fpMapsUrl')) document.getElementById('fpMapsUrl').value = s.mapsUrl || 'https://goo.gl/maps/BPHVUQhLn2WfJgUg7';
  if (document.getElementById('fpInstagramUrl')) document.getElementById('fpInstagramUrl').value = s.instagramUrl || 'https://www.instagram.com/lamensa_multicuisine';
  if (document.getElementById('fpEmail')) document.getElementById('fpEmail').value = s.email || 'lamensasurat@gmail.com';
  if (document.getElementById('fpReviewUrl')) document.getElementById('fpReviewUrl').value = s.reviewUrl || 'https://g.page/r/review';

  renderFrontPageTilesList();
}

function renderFrontPageTilesList() {
  const container = document.getElementById('frontPageTilesListContainer');
  if (!container) return;

  container.innerHTML = adminState.frontPageCards.map((c, idx) => `
    <div class="bg-white p-3.5 rounded-2xl border border-[#e6e2d6] space-y-2 text-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-bold text-[#0d2d24] text-sm">${c.title}</span>
          <span class="text-[9px] font-extrabold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase">${c.badge}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold">
            ${c.shown ? 'Shown' : 'Hidden'}
          </span>
          <button type="button" onclick="moveFrontCard(${idx}, -1)" class="p-1 text-stone-400 hover:text-stone-700"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
          <button type="button" onclick="moveFrontCard(${idx}, 1)" class="p-1 text-stone-400 hover:text-stone-700"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
        </div>
      </div>
      <div>
        <input type="text" value="${c.url}" onchange="updateFrontCardUrl(${idx}, this.value)" placeholder="Card URL (https://...)" class="w-full px-3 py-1.5 rounded-xl bg-[#f7f5ef] border border-[#e6e2d6] text-xs font-mono outline-none" />
      </div>
    </div>
  `).join('');
}

function moveFrontCard(idx, delta) {
  const target = idx + delta;
  if (target < 0 || target >= adminState.frontPageCards.length) return;
  const temp = adminState.frontPageCards[idx];
  adminState.frontPageCards[idx] = adminState.frontPageCards[target];
  adminState.frontPageCards[target] = temp;
  renderFrontPageTilesList();
}

function updateFrontCardUrl(idx, val) {
  adminState.frontPageCards[idx].url = val.trim();
}

function addCustomFrontCard() {
  const title = document.getElementById('newFpCardTitle').value.trim();
  const url = document.getElementById('newFpCardUrl').value.trim();
  if (!title || !url) return;

  adminState.frontPageCards.push({
    id: 'card-' + Date.now(),
    title,
    badge: 'CUSTOM',
    shown: true,
    url,
    image: ''
  });

  document.getElementById('newFpCardTitle').value = '';
  document.getElementById('newFpCardUrl').value = '';
  renderFrontPageTilesList();
}

async function saveFrontPageSettings(e) {
  e.preventDefault();
  adminState.settings.profileImgUrl = document.getElementById('fpProfileImg').value.trim();
  adminState.settings.bgImgUrl = document.getElementById('fpBgImg').value.trim();
  adminState.settings.mapsUrl = document.getElementById('fpMapsUrl').value.trim();
  adminState.settings.instagramUrl = document.getElementById('fpInstagramUrl').value.trim();
  adminState.settings.email = document.getElementById('fpEmail').value.trim();
  adminState.settings.reviewUrl = document.getElementById('fpReviewUrl').value.trim();

  await pushStateToFirebase();
  showAdminToast('Front page settings updated to cloud!', 'success');
}

// 8. TAB 5: BACKUP & FACTORY RESET (Screenshot 3)
function exportBackupJson() {
  const fullBackup = {
    settings: adminState.settings,
    categories: adminState.categories,
    items: adminState.items,
    quickFilters: adminState.quickFilters,
    customDishOptions: adminState.customDishOptions,
    frontPageCards: adminState.frontPageCards,
    exportedAt: new Date().toISOString()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `la-mensa-menu-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showAdminToast('Backup JSON exported successfully!', 'success');
}

async function confirmFactoryReset() {
  const pass = prompt('Are you sure you want to reset the catalog? Type "RESET" to confirm:');
  if (pass !== 'RESET') return;

  try {
    const res = await fetch('/api/data');
    const local = await res.json();
    if (local && local.data) {
      adminState.settings = local.data.settings;
      adminState.categories = local.data.categories;
      adminState.items = local.data.items;
      await pushStateToFirebase();
      updateMetrics();
      renderDishesTable();
      renderCategoriesGrid();
      showAdminToast('Menu catalog restored to factory defaults!', 'success');
    }
  } catch (err) {
    showAdminToast('Reset failed: ' + err.message, 'error');
  }
}

// 9. Helpers & Listeners
function populateCategoryDropdowns() {
  const filterSel = document.getElementById('dishCategoryFilter');
  const modalSel = document.getElementById('dishFormCategory');

  if (filterSel) {
    const curr = filterSel.value;
    filterSel.innerHTML = '<option value="all">All Categories</option>' + adminState.categories.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
    filterSel.value = curr || 'all';
  }

  if (modalSel) {
    modalSel.innerHTML = adminState.categories.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
  }
}

function setupEventListeners() {
  // Dish search
  const search = document.getElementById('dishSearchInput');
  if (search) {
    search.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value;
      renderDishesTable();
    });
  }

  // Dish category filter
  const catFilter = document.getElementById('dishCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      adminState.categoryFilter = e.target.value;
      renderDishesTable();
    });
  }

  // Dish stock filter
  const stockFilter = document.getElementById('dishStockFilter');
  if (stockFilter) {
    stockFilter.addEventListener('change', (e) => {
      adminState.stockFilter = e.target.value;
      renderDishesTable();
    });
  }

  // Dish diet filter
  const dietFilter = document.getElementById('dishDietFilter');
  if (dietFilter) {
    dietFilter.addEventListener('change', (e) => {
      adminState.dietFilter = e.target.value;
      renderDishesTable();
    });
  }
}

// Image Uploader (ImgBB)
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('dishImageUploadStatus');
  const imgInput = document.getElementById('dishFormImage');
  const key = window.IMGBB_API_KEY || '1c4e7f2fb1d5bcd0570a5894a27546db';

  statusEl.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Uploading to ImgBB...';

  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      const url = data.data.display_url || data.data.url;
      imgInput.value = url;
      statusEl.innerHTML = '<span class="text-emerald-600 font-bold">✓ Uploaded successfully!</span>';
      showAdminToast('Dish photo uploaded to ImgBB!', 'success');
    } else {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }
  } catch (err) {
    statusEl.innerHTML = '<span class="text-rose-600">Failed: ' + err.message + '</span>';
  }
}

// Lock Admin Session (Brings back the lock screen on this page)
function lockAdminSession() {
  sessionStorage.removeItem('lamensa_admin_auth');
  const lockScreen = document.getElementById('adminLockScreen');
  if (lockScreen) {
    lockScreen.classList.remove('hidden');
    const passInput = document.getElementById('adminPasswordInput');
    const errEl = document.getElementById('adminLoginError');
    if (errEl) errEl.classList.add('hidden');
    if (passInput) {
      passInput.value = '';
      setTimeout(() => passInput.focus(), 150);
    }
  }
  showAdminToast('Admin screen locked.', 'info');
}

// Logo Management UI Handlers
function updateAdminLogoUI(url) {
  const adminLogoEl = document.getElementById('adminHeaderLogoContainer');
  const previewEl = document.getElementById('profLogoPreview');
  if (url) {
    if (adminLogoEl) adminLogoEl.innerHTML = `<img src="${url}" alt="Logo" class="w-full h-full object-cover rounded-xl" />`;
    if (previewEl) previewEl.innerHTML = `<img src="${url}" alt="Logo" class="w-full h-full object-cover rounded-xl" />`;
  } else {
    if (adminLogoEl) adminLogoEl.innerHTML = `<i class="fa-solid fa-utensils"></i>`;
    if (previewEl) previewEl.innerHTML = `<i class="fa-solid fa-utensils text-base"></i>`;
  }
}

async function uploadLogoToImgBB(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('profLogoUploadStatus');
  const urlInput = document.getElementById('profLogoUrl');
  const key = window.IMGBB_API_KEY || '1c4e7f2fb1d5bcd0570a5894a27546db';

  if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Uploading logo to ImgBB...';

  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      const url = data.data.display_url || data.data.url;
      if (urlInput) urlInput.value = url;
      updateAdminLogoUI(url);
      if (statusEl) statusEl.innerHTML = '<span class="text-emerald-600 font-bold">✓ Logo uploaded successfully! Click "Update Draft & Save" below.</span>';
      showAdminToast('Restaurant logo uploaded!', 'success');
    } else {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span class="text-rose-600">Upload failed: ' + err.message + '</span>';
  }
}

// Toast System
function showAdminToast(message, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-[#0d2d24] text-[#ffdaa9] border-[#dfb15b]/40' :
             type === 'warning' ? 'bg-amber-950 text-amber-200 border-amber-500/40' :
             'bg-[#09221b] text-white border-white/20';

  const icon = type === 'success' ? 'fa-circle-check text-emerald-400' :
               type === 'warning' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-info text-[#dfb15b]';

  toast.className = `${bg} px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border flex items-center gap-2.5 animate-admin-toast pointer-events-auto max-w-sm`;
  toast.innerHTML = `<i class="fa-solid ${icon} text-sm"></i> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
