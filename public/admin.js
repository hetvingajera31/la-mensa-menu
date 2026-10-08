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
  ],
  draftChangesCount: 0,
  hasDraftChanges: false
};

const DRAFT_STORAGE_KEY = 'lamensa_admin_draft_data';
let firebaseAdminRtdb = null;
const DEFAULT_ADMIN_PASS = 'lamensagroup';

// 1. Mark Changes in Draft (Conserves Firebase Cloud Write Quota!)
function markDraftChanged(actionDescription) {
  adminState.draftChangesCount = (adminState.draftChangesCount || 0) + 1;
  adminState.hasDraftChanges = true;

  const draftPayload = {
    settings: adminState.settings,
    categories: adminState.categories,
    items: adminState.items,
    quickFilters: adminState.quickFilters,
    customDishOptions: adminState.customDishOptions,
    frontPageCards: adminState.frontPageCards,
    draftChangesCount: adminState.draftChangesCount,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
  } catch (e) {
    console.warn('Draft save error:', e);
  }

  updateDraftNavigationUI();

  if (actionDescription) {
    showAdminToast(`${actionDescription} saved to Draft! Click "Save & Changes" in navbar to apply.`, 'info');
  }
}

// 2. Update Navbar Button & Cloud Status Badge UI
function updateDraftNavigationUI() {
  const btn = document.getElementById('navSavePublishBtn');
  const badge = document.getElementById('draftChangesBadge');
  const cloudBadge = document.getElementById('cloudStatusBadge');

  const count = adminState.draftChangesCount || 0;

  if (adminState.hasDraftChanges && count > 0) {
    if (badge) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    }
    if (btn) {
      btn.classList.add('ring-2', 'ring-amber-300', 'shadow-lg');
    }
    if (cloudBadge) {
      cloudBadge.className = 'px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 sm:gap-2 shadow-sm';
      cloudBadge.innerHTML = `<span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-400 animate-ping"></span><span class="hidden sm:inline">${count} Draft Pending</span><span class="sm:hidden">${count} Draft</span>`;
    }
  } else {
    if (badge) {
      badge.classList.add('hidden');
    }
    if (btn) {
      btn.classList.remove('ring-2', 'ring-amber-300', 'shadow-lg');
    }
    if (cloudBadge) {
      cloudBadge.className = 'px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 sm:gap-2 shadow-sm';
      cloudBadge.innerHTML = `<span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="hidden sm:inline">Cloud Synced (Live)</span><span class="sm:hidden">Live</span>`;
    }
  }
}

// 3. Publish All Draft Changes to Firebase Cloud in ONE Single Request
async function publishDraftToFirebase() {
  const btn = document.getElementById('navSavePublishBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs"></i> <span>Saving...</span>';
  }

  try {
    const pushed = await pushStateToFirebase();
    if (pushed) {
      adminState.hasDraftChanges = false;
      adminState.draftChangesCount = 0;
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      updateDraftNavigationUI();
      showAdminToast('All draft changes published to live menu!', 'success');
    } else {
      showAdminToast('Could not sync to cloud. Your draft is still saved locally.', 'warning');
    }
  } catch (err) {
    showAdminToast('Sync error: ' + err.message, 'warning');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <i class="fa-solid fa-floppy-disk text-xs"></i>
        <span class="hidden xs:inline sm:inline">Save & Changes</span>
        <span class="xs:hidden sm:hidden">Save</span>
        <span id="draftChangesBadge" class="hidden px-1.5 py-0.2 rounded-full bg-[#0d2d24] text-[#ffdaa9] text-[10px] font-extrabold">0</span>
      `;
      updateDraftNavigationUI();
    }
  }
}

// Warn if navigating away with unsaved draft
window.addEventListener('beforeunload', (e) => {
  if (adminState.hasDraftChanges && adminState.draftChangesCount > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

let isAdminAuthed = false;

// Clear any stored admin session so refresh/reload always requires the password screen
try {
  sessionStorage.removeItem('lamensa_admin_auth');
} catch (e) {}

// Check Admin Authentication on Load (Always requires password on page reload / refresh)
function checkAdminAuth() {
  const lockScreen = document.getElementById('adminLockScreen');
  if (!lockScreen) return;
  
  if (isAdminAuthed) {
    lockScreen.classList.add('hidden');
  } else {
    lockScreen.classList.remove('hidden');
    const passInput = document.getElementById('adminPasswordInput');
    const errEl = document.getElementById('adminLoginError');
    if (errEl) errEl.classList.add('hidden');
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
    isAdminAuthed = true;
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

  // Check if an uncommitted local draft exists in localStorage (preserves work on refresh!)
  try {
    const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftRaw) {
      const draftObj = JSON.parse(draftRaw);
      if (draftObj && draftObj.items && draftObj.items.length) {
        if (adminState.items && adminState.items.length > draftObj.items.length) {
          console.log('Stale local draft ignored because cloud database has more/newer items (' + adminState.items.length + ' vs ' + draftObj.items.length + ')');
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } else {
          adminState.settings = draftObj.settings || adminState.settings;
          adminState.categories = draftObj.categories || adminState.categories;
          adminState.items = draftObj.items || adminState.items;
          if (draftObj.quickFilters) adminState.quickFilters = draftObj.quickFilters;
          if (draftObj.customDishOptions) adminState.customDishOptions = draftObj.customDishOptions;
          if (draftObj.frontPageCards) adminState.frontPageCards = draftObj.frontPageCards;
          adminState.draftChangesCount = draftObj.draftChangesCount || 1;
          adminState.hasDraftChanges = true;
          console.log('Restored unsaved local draft with', adminState.draftChangesCount, 'changes');
        }
      }
    }
  } catch (draftErr) {
    console.warn('Draft restoration warning:', draftErr);
  }

  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();
  populateCategoryDropdowns();
  populateProfileForm();
  populateFrontPageForm();
  updateDraftNavigationUI();
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
          // If admin has uncommitted draft changes, do NOT overwrite their screen!
          if (adminState.hasDraftChanges) return;

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

// Toggle Stock Instant Action (Saved to Draft)
function toggleItemStock(itemId) {
  const item = adminState.items.find(i => i.id === itemId);
  if (!item) return;

  item.isAvailable = item.isAvailable === false ? true : false;
  
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();

  markDraftChanged(`"${item.name}" marked as ${item.isAvailable ? 'In Stock' : 'Sold Out'}`);
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
    originalPrice: null,
    portion: '',
    prepTime: '',
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
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();
  markDraftChanged(id ? `Dish "${payload.name}" updated` : `New dish "${payload.name}" added`);
}

async function deleteDish(itemId, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  adminState.items = adminState.items.filter(i => i.id !== itemId);
  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();
  markDraftChanged(`Dish "${name}" deleted`);
}

// 5. TAB 2: CATEGORIES MANAGEMENT (Screenshot 1)
function renderCategoriesGrid() {
  const container = document.getElementById('categoriesGridContainer');
  if (!container) return;

  container.innerHTML = adminState.categories.map((cat, index) => {
    const totalInCat = adminState.items.filter(i => i.categoryId === cat.id).length;
    const soldOutInCat = adminState.items.filter(i => i.categoryId === cat.id && i.isAvailable === false).length;
    const isCatShown = cat.isShown !== false && !cat.isHidden;

    return `
      <div class="bg-white rounded-2xl p-3.5 sm:p-4 border ${isCatShown ? 'border-[#e6e2d6]' : 'border-stone-300 bg-stone-50/70 opacity-80'} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:border-[#dfb15b] transition">
        
        <!-- Top (Mobile) / Left (Desktop): Index + Category Name & Subtitle -->
        <div class="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div class="w-8 h-8 rounded-xl ${isCatShown ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-100 text-stone-500 border-stone-200'} font-bold text-xs flex items-center justify-center border shrink-0 shadow-xs">
            ${index + 1}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-sm sm:text-base ${isCatShown ? 'text-[#0d2d24]' : 'text-stone-500 line-through decoration-stone-400'} truncate">
              ${cat.name}
            </h4>
            <div class="text-[11px] text-stone-500 mt-0.5 flex items-center flex-wrap gap-1">
              <span>Section • <strong class="${isCatShown ? 'text-emerald-700' : 'text-stone-500'}">${totalInCat} dishes</strong></span>
              ${soldOutInCat > 0 ? `<span class="text-rose-600 font-semibold ml-1">• ${soldOutInCat} Sold Out</span>` : ''}
              ${!isCatShown ? `<span class="text-amber-800 font-bold ml-1 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-300 text-[10px]">Hidden from Menu</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Bottom (Mobile) / Right (Desktop): Move Controls, Shown/Unshown Button, Edit, Delete -->
        <div class="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#f0eee6] shrink-0">
          
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

          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Bulk Stock Action Dropdown -->
            <div class="relative inline-block" id="bulkStockDropdownWrap-${cat.id}">
              <button
                type="button"
                onclick="toggleBulkStockDropdown(event, '${cat.id}')"
                title="Bulk stock action for all ${totalInCat} dishes in ${cat.name}"
                class="px-2.5 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${soldOutInCat === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100' : (soldOutInCat === totalInCat ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100' : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100')}"
              >
                <i class="fa-solid fa-boxes-stacked text-[10px]"></i>
                <span>${soldOutInCat === 0 ? 'All In Stock' : (soldOutInCat === totalInCat ? 'All Sold Out' : `${totalInCat - soldOutInCat}/${totalInCat} In Stock`)}</span>
                <i class="fa-solid fa-chevron-down text-[8px] opacity-70"></i>
              </button>
              
              <div id="bulkStockMenu-${cat.id}" class="bulk-stock-menu hidden absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-[#e6e2d6] py-1.5 z-30 text-xs font-bold divide-y divide-[#f5f2e9]">
                <button
                  type="button"
                  onclick="setCategoryBulkStock('${cat.id}', true); hideAllBulkStockDropdowns();"
                  class="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <i class="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                  <span>All In Stock</span>
                </button>
                <button
                  type="button"
                  onclick="setCategoryBulkStock('${cat.id}', false); hideAllBulkStockDropdowns();"
                  class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition cursor-pointer"
                >
                  <i class="fa-solid fa-circle-xmark text-rose-600 text-xs"></i>
                  <span>All Sold Out</span>
                </button>
              </div>
            </div>

            <!-- Shown / Unshown Interactive Toggle Button -->
            <button
              onclick="toggleCategoryVisibility('${cat.id}')"
              title="Click to ${isCatShown ? 'hide category from' : 'show category in'} digital menu"
              class="px-2.5 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${isCatShown ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100' : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'}"
            >
              <i class="fa-solid ${isCatShown ? 'fa-eye text-emerald-600' : 'fa-eye-slash text-stone-400'} text-[10px]"></i>
              <span>${isCatShown ? 'Shown' : 'Unshown'}</span>
            </button>

            <button onclick="openBulkCategoryImageModal('${cat.id}')" title="Set same image on all dishes in this category" class="w-8 h-8 rounded-xl bg-[#f7f5ef] hover:bg-[#ffdaa9] text-stone-700 hover:text-[#0d2d24] flex items-center justify-center transition border border-[#e6e2d6]">
              <i class="fa-solid fa-images text-xs"></i>
            </button>

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

      </div>
    `;
  }).join('');
}

// Toggle Category Visibility (Shown vs Unshown in Customer Menu)
function toggleCategoryVisibility(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  const currentlyShown = cat.isShown !== false && !cat.isHidden;
  const newShown = !currentlyShown;
  cat.isShown = newShown;
  cat.isHidden = !newShown;

  renderCategoriesGrid();
  markDraftChanged(`"${cat.name}" marked as ${newShown ? 'Shown' : 'Unshown'}`);
}

// Bulk Toggle Stock for All Dishes in a Specific Category
function setCategoryBulkStock(categoryId, isAvailable) {
  const cat = adminState.categories.find(c => c.id === categoryId);
  const catName = cat ? cat.name : 'Category';
  
  const dishesInCat = adminState.items.filter(i => i.categoryId === categoryId);
  if (dishesInCat.length === 0) {
    showAdminToast(`No dishes found in "${catName}"`, 'info');
    return;
  }

  let updatedCount = 0;
  dishesInCat.forEach(item => {
    item.isAvailable = Boolean(isAvailable);
    updatedCount++;
  });

  updateMetrics();
  renderDishesTable();
  renderCategoriesGrid();
  updateBulkStockBarUI();

  const statusLabel = isAvailable ? 'In Stock' : 'Sold Out';
  markDraftChanged(`All ${updatedCount} dishes in "${catName}" set to ${statusLabel}`);
  showAdminToast(`All ${updatedCount} dishes in "${catName}" are now ${statusLabel}!`, 'success');
}

// Bulk Toggle for Current Filtered Category in Dishes Tab
function applyBulkStockToCurrentCategory(isAvailable) {
  const catFilter = adminState.categoryFilter;
  const statusLabel = isAvailable ? 'In Stock' : 'Sold Out';

  if (catFilter && catFilter !== 'all') {
    setCategoryBulkStock(catFilter, isAvailable);
  } else {
    const totalDishes = adminState.items.length;
    const confirmed = window.confirm(`Are you sure you want to set ALL ${totalDishes} dishes in the entire menu to "${statusLabel}"?`);
    if (!confirmed) return;

    adminState.items.forEach(item => {
      item.isAvailable = Boolean(isAvailable);
    });

    updateMetrics();
    renderDishesTable();
    renderCategoriesGrid();
    updateBulkStockBarUI();

    markDraftChanged(`All ${totalDishes} dishes set to ${statusLabel}`);
    showAdminToast(`All ${totalDishes} dishes in the menu are now ${statusLabel}!`, 'success');
  }
}

// Dynamic button text for current selected category in Dishes tab
function updateBulkStockBarUI() {
  const catFilter = adminState.categoryFilter;
  const inBtn = document.getElementById('bulkInStockBtnText');
  const outBtn = document.getElementById('bulkSoldOutBtnText');
  if (!inBtn || !outBtn) return;

  if (catFilter && catFilter !== 'all') {
    const cat = adminState.categories.find(c => c.id === catFilter);
    const shortName = cat ? cat.name : 'Category';
    inBtn.textContent = `In Stock (${shortName})`;
    outBtn.textContent = `Sold Out (${shortName})`;
  } else {
    inBtn.textContent = 'All In Stock';
    outBtn.textContent = 'All Sold Out';
  }
}

function openBulkCategoryImageModal(categoryId) {
  populateCategoryDropdowns();
  const modal = document.getElementById('bulkCategoryImageModal');
  const sel = document.getElementById('bulkCatImageCategory');
  const urlInput = document.getElementById('bulkCatImageUrl');
  const statusEl = document.getElementById('bulkCatImageStatus');
  const fileInput = document.getElementById('bulkCatImageFile');
  if (sel) sel.value = categoryId || '';
  if (urlInput) urlInput.value = '';
  if (statusEl) statusEl.textContent = '';
  if (fileInput) fileInput.value = '';
  previewBulkCategoryImage();
  if (modal) modal.classList.remove('hidden');
}

function closeBulkCategoryImageModal() {
  const modal = document.getElementById('bulkCategoryImageModal');
  if (modal) modal.classList.add('hidden');
}

function previewBulkCategoryImage() {
  const urlInput = document.getElementById('bulkCatImageUrl');
  const wrap = document.getElementById('bulkCatImagePreviewWrap');
  const img = document.getElementById('bulkCatImagePreview');
  const url = urlInput ? urlInput.value.trim() : '';
  if (url && wrap && img) {
    img.src = url;
    wrap.classList.remove('hidden');
  } else if (wrap) {
    wrap.classList.add('hidden');
  }
}

async function uploadBulkCategoryImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('bulkCatImageStatus');
  const urlInput = document.getElementById('bulkCatImageUrl');
  const key = window.IMGBB_API_KEY || '1c4e7f2fb1d5bcd0570a5894a27546db';

  if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Uploading to ImgBB...';

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
      previewBulkCategoryImage();
      if (statusEl) statusEl.innerHTML = '<span class="text-emerald-600 font-bold">✓ Uploaded. Click Apply to All Dishes.</span>';
      showAdminToast('Image uploaded. Apply it to the category.', 'success');
    } else {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span class="text-rose-600">Failed: ' + err.message + '</span>';
  }
}

function applyBulkCategoryImage() {
  const categoryId = (document.getElementById('bulkCatImageCategory') || {}).value || '';
  const imageUrl = ((document.getElementById('bulkCatImageUrl') || {}).value || '').trim();

  if (!categoryId) {
    showAdminToast('Please select a category.', 'warning');
    return;
  }
  if (!imageUrl) {
    showAdminToast('Please upload an image or paste an image URL.', 'warning');
    return;
  }

  const cat = adminState.categories.find(c => c.id === categoryId);
  const catName = cat ? cat.name : 'Category';
  const dishesInCat = adminState.items.filter(i => i.categoryId === categoryId);

  if (dishesInCat.length === 0) {
    showAdminToast(`No dishes found in "${catName}"`, 'info');
    return;
  }

  const confirmed = window.confirm(`Apply this image to all ${dishesInCat.length} dishes in "${catName}"? Existing dish photos will be replaced.`);
  if (!confirmed) return;

  dishesInCat.forEach(item => {
    item.image = imageUrl;
  });

  renderDishesTable();
  renderCategoriesGrid();
  closeBulkCategoryImageModal();
  markDraftChanged(`Same image applied to all ${dishesInCat.length} dishes in "${catName}"`);
  showAdminToast(`Image applied to all ${dishesInCat.length} dishes in "${catName}". Save draft to publish.`, 'success');
}

// Category Card Dropdown Handlers
function toggleBulkStockDropdown(event, catId) {
  if (event) event.stopPropagation();
  const menu = document.getElementById(`bulkStockMenu-${catId}`);
  if (!menu) return;
  const wasHidden = menu.classList.contains('hidden');
  hideAllBulkStockDropdowns();
  if (wasHidden) {
    menu.classList.remove('hidden');
  }
}

function hideAllBulkStockDropdowns() {
  document.querySelectorAll('.bulk-stock-menu').forEach(m => m.classList.add('hidden'));
}

document.addEventListener('click', () => {
  hideAllBulkStockDropdowns();
});

// Handle Move Category Input from card
function handleCategoryMoveInput(catId) {
  const inputEl = document.getElementById(`catPosInput-${catId}`);
  if (!inputEl) return;
  const targetPos = parseInt(inputEl.value, 10);
  if (isNaN(targetPos)) return;
  moveCategoryToPosition(catId, targetPos);
}

// Move Category to specific 1-based index (e.g. typing 5 moves it to 5th position)
function moveCategoryToPosition(catId, targetPos) {
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
  markDraftChanged(`"${movedCat.name}" moved to position ${targetIdx + 1}`);
}

// Move Category Order (Up/Down step)
function moveCategory(catId, delta) {
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
  markDraftChanged(`"${temp.name}" position updated`);
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
      isShown: true,
      isHidden: false,
      ...payload
    });
  }

  closeCategoryModal();
  updateMetrics();
  renderCategoriesGrid();
  populateCategoryDropdowns();
  markDraftChanged(id ? `Category "${payload.name}" updated` : `New category "${payload.name}" added`);
}

async function deleteCategory(catId, name, itemCount) {
  if (itemCount > 0) {
    alert(`Cannot delete category "${name}" because it contains ${itemCount} dishes. Please reassign or delete dishes first.`);
    return;
  }
  if (!confirm(`Delete category "${name}"?`)) return;

  adminState.categories = adminState.categories.filter(c => c.id !== catId);
  updateMetrics();
  renderCategoriesGrid();
  populateCategoryDropdowns();
  markDraftChanged(`Category "${name}" deleted`);
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

function addCustomTag() {
  const input = document.getElementById('newCustomTagInput');
  const val = input.value.trim();
  if (!val) return;
  if (adminState.customDishOptions.includes(val)) return;
  adminState.customDishOptions.push(val);
  input.value = '';
  renderCustomTags();
  markDraftChanged(`Custom option "${val}" added`);
}

function removeCustomTag(tag) {
  adminState.customDishOptions = adminState.customDishOptions.filter(t => t !== tag);
  renderCustomTags();
  markDraftChanged(`Custom option "${tag}" removed`);
}

function saveProfileSettings(e) {
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
  }

  markDraftChanged('Restaurant profile & logo updated');
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

  container.innerHTML = adminState.frontPageCards.map((c, idx) => {
    const isShown = c.shown !== false;

    return `
      <div class="bg-white p-3.5 rounded-2xl border ${isShown ? 'border-[#e6e2d6]' : 'border-stone-300 bg-stone-50/70 opacity-80'} space-y-2.5 text-xs">
        
        <!-- Header: Title, Badge, Shown/Unshown Button & Reorder -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            ${c.image ? `<img src="${c.image}" class="w-7 h-7 rounded-lg object-cover border border-[#e6e2d6] shrink-0" />` : ''}
            <span class="font-bold ${isShown ? 'text-[#0d2d24]' : 'text-stone-500 line-through'} text-sm truncate">${c.title}</span>
            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase shrink-0">${c.badge}</span>
          </div>
          
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Shown / Unshown Toggle Button -->
            <button
              type="button"
              onclick="toggleFrontCardShown(${idx})"
              title="Click to ${isShown ? 'hide card from' : 'show card on'} front page"
              class="px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${isShown ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100' : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'}"
            >
              <i class="fa-solid ${isShown ? 'fa-eye text-emerald-600' : 'fa-eye-slash text-stone-400'} text-[9px]"></i>
              <span>${isShown ? 'Shown' : 'Unshown'}</span>
            </button>

            <!-- Reorder buttons -->
            <button type="button" onclick="moveFrontCard(${idx}, -1)" title="Move up" class="p-1 rounded text-stone-400 hover:text-stone-700"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
            <button type="button" onclick="moveFrontCard(${idx}, 1)" title="Move down" class="p-1 rounded text-stone-400 hover:text-stone-700"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
            
            ${c.badge === 'CUSTOM' ? `
              <button type="button" onclick="deleteCustomFrontCard(${idx})" title="Delete card" class="p-1 text-stone-400 hover:text-rose-600"><i class="fa-solid fa-trash text-[10px]"></i></button>
            ` : ''}
          </div>
        </div>

        <!-- Inputs Row: URL and Image -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#f7f5ef]">
          <div>
            <label class="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Destination URL</label>
            <input
              type="text"
              value="${c.url || ''}"
              onchange="updateFrontCardUrl(${idx}, this.value)"
              placeholder="Card URL (https://...)"
              class="w-full px-3 py-1.5 rounded-xl bg-[#f7f5ef] border border-[#e6e2d6] text-xs font-mono outline-none focus:border-[#dfb15b]"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Card Tile Image</label>
            <div class="flex items-center gap-1.5">
              <input
                type="text"
                value="${c.image || ''}"
                onchange="updateFrontCardImage(${idx}, this.value)"
                placeholder="Image URL (optional)"
                class="flex-1 px-3 py-1.5 rounded-xl bg-[#f7f5ef] border border-[#e6e2d6] text-xs outline-none focus:border-[#dfb15b]"
                id="fpCardImgInput-${idx}"
              />
              <label class="px-2.5 py-1.5 rounded-xl bg-[#0d2d24] hover:bg-[#153f33] text-[#ffdaa9] font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0 transition shadow-xs">
                <i class="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                <span>Upload</span>
                <input type="file" accept="image/*" class="hidden" onchange="uploadFrontCardImg(${idx}, event)" />
              </label>
            </div>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

function toggleFrontCardShown(idx) {
  const card = adminState.frontPageCards[idx];
  if (!card) return;

  card.shown = card.shown === false ? true : false;
  renderFrontPageTilesList();
  markDraftChanged(`Front Card "${card.title}" set to ${card.shown ? 'Shown' : 'Unshown'}`);
}

function updateFrontCardImage(idx, val) {
  const card = adminState.frontPageCards[idx];
  if (!card) return;
  card.image = val.trim();
  renderFrontPageTilesList();
  markDraftChanged(`Tile image for "${card.title}" updated`);
}

async function uploadFrontCardImg(idx, e) {
  const file = e.target.files[0];
  if (!file) return;

  const card = adminState.frontPageCards[idx];
  const key = window.IMGBB_API_KEY || '1c4e7f2fb1d5bcd0570a5894a27546db';
  showAdminToast(`Uploading image for "${card.title}"...`, 'info');

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
      card.image = url;
      renderFrontPageTilesList();
      markDraftChanged(`Image for "${card.title}" uploaded`);
      showAdminToast(`Tile image for "${card.title}" uploaded successfully!`, 'success');
    } else {
      throw new Error(data.error ? data.error.message : 'Upload failed');
    }
  } catch (err) {
    showAdminToast('Upload error: ' + err.message, 'warning');
  }
}

function moveFrontCard(idx, delta) {
  const target = idx + delta;
  if (target < 0 || target >= adminState.frontPageCards.length) return;
  const temp = adminState.frontPageCards[idx];
  adminState.frontPageCards[idx] = adminState.frontPageCards[target];
  adminState.frontPageCards[target] = temp;
  renderFrontPageTilesList();
  markDraftChanged('Front cards reordered');
}

function updateFrontCardUrl(idx, val) {
  adminState.frontPageCards[idx].url = val.trim();
  markDraftChanged(`URL for "${adminState.frontPageCards[idx].title}" updated`);
}

function deleteCustomFrontCard(idx) {
  const name = adminState.frontPageCards[idx].title;
  adminState.frontPageCards.splice(idx, 1);
  renderFrontPageTilesList();
  markDraftChanged(`Custom card "${name}" removed`);
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
  markDraftChanged(`Custom card "${title}" added`);
}

function saveFrontPageSettings(e) {
  e.preventDefault();
  adminState.settings.profileImgUrl = document.getElementById('fpProfileImg').value.trim();
  adminState.settings.bgImgUrl = document.getElementById('fpBgImg').value.trim();
  adminState.settings.mapsUrl = document.getElementById('fpMapsUrl').value.trim();
  adminState.settings.instagramUrl = document.getElementById('fpInstagramUrl').value.trim();
  adminState.settings.email = document.getElementById('fpEmail').value.trim();
  adminState.settings.reviewUrl = document.getElementById('fpReviewUrl').value.trim();

  markDraftChanged('Front page settings updated');
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
  const bulkSel = document.getElementById('bulkCatImageCategory');

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

  if (bulkSel) {
    const currBulk = bulkSel.value;
    bulkSel.innerHTML = '<option value="">Select category</option>' + adminState.categories.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
    if (currBulk && adminState.categories.some(c => c.id === currBulk)) {
      bulkSel.value = currBulk;
    }
  }

  updateBulkStockBarUI();
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
      updateBulkStockBarUI();
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
  isAdminAuthed = false;
  try {
    sessionStorage.removeItem('lamensa_admin_auth');
  } catch (e) {}
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

// Ensure reload or closing tab always locks admin session
window.addEventListener('beforeunload', () => {
  isAdminAuthed = false;
  try {
    sessionStorage.removeItem('lamensa_admin_auth');
  } catch (e) {}
});

// Logo Management UI Handlers
function updateAdminLogoUI(url) {
  const adminLogoEl = document.getElementById('adminHeaderLogoContainer');
  const previewEl = document.getElementById('profLogoPreview');
  if (url) {
    if (adminLogoEl) adminLogoEl.innerHTML = `<img src="${url}" alt="Logo" class="w-full h-full object-cover" />`;
    if (previewEl) previewEl.innerHTML = `<img src="${url}" alt="Logo" class="w-full h-full object-cover" />`;
  } else {
    if (adminLogoEl) adminLogoEl.innerHTML = `
      <div class="w-full h-full rounded-t-[13px] rounded-b-sm border border-[#dfb15b]/30 flex flex-col items-center justify-center bg-gradient-to-b from-[#10352a] to-[#09221b] overflow-hidden">
        <i class="fa-solid fa-utensils text-[#dfb15b] text-[10px]"></i>
        <span class="text-[5px] font-serif font-bold text-[#ffdaa9] leading-tight">LM</span>
      </div>
    `;
    if (previewEl) previewEl.innerHTML = `
      <div class="w-full h-full rounded-t-[20px] rounded-b-lg border border-[#dfb15b]/35 flex flex-col items-center justify-center bg-gradient-to-b from-[#10352a] to-[#09221b] overflow-hidden p-0.5 text-center">
        <i class="fa-solid fa-utensils text-[#dfb15b] text-sm mb-0.5"></i>
        <span class="text-[6px] font-serif font-bold tracking-widest text-[#ffdaa9] uppercase leading-none">LA MENSA</span>
      </div>
    `;
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
