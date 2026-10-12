const DISH_PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

function isDishImageEmpty(url) {
  const u = (url || '').trim();
  if (!u) return true;
  return u.indexOf('photo-1546069901-ba9599a7e63c') !== -1;
}

function resolveDishImage(item) {
  const cat = (state.categories || []).find(c => c.id === item.categoryId);
  const categoryImg = cat && cat.defaultImage ? cat.defaultImage.trim() : '';
  if (cat && cat.forceImage && categoryImg) return categoryImg;
  if (!isDishImageEmpty(item.image)) return item.image;
  return categoryImg || DISH_PLACEHOLDER_IMG;
}

// Global App State (View Only)
const state = {
  settings: {},
  categories: [],
  items: [],
  quickFilters: [],
  customDishOptions: [],
  activeCategory: 'all',
  activeQuickFilter: 'all',
  activeDietFilter: 'all', // legacy support
  searchQuery: ''
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initMenuSource();
  setupEventListeners();
});

let firebaseInitialized = false;

function initMenuSource() {
  const cfg = window.FIREBASE_CONFIG;
  if (window.firebase && cfg && cfg.apiKey && cfg.apiKey.trim() !== '') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      firebaseInitialized = true;

      // 1. Check Realtime Database (preferred when databaseURL is configured)
      if (cfg.databaseURL && firebase.database) {
        console.log('⚡ Connected to Firebase Realtime Database:', cfg.databaseURL);
        const rtdbRef = firebase.database().ref('menu');

        rtdbRef.on('value', (snapshot) => {
          const loadingEl = document.getElementById('loadingState');
          const contentEl = document.getElementById('menuContent');
          const data = snapshot.val();

          if (data && data.items && data.items.length) {
            state.settings = data.settings || {};
            state.categories = data.categories || [];
            state.items = data.items || [];
            if (data.quickFilters) state.quickFilters = data.quickFilters;
            if (data.customDishOptions) state.customDishOptions = data.customDishOptions;

            applySettingsToUI();
            renderQuickFilterChips();
            renderCategoryNav();
            renderMenu();

            if (loadingEl) loadingEl.classList.add('hidden');
            if (contentEl) contentEl.classList.remove('hidden');
          } else {
            fetchMenuData();
          }
        }, (err) => {
          console.warn('Realtime DB read error, using local API:', err);
          fetchMenuData();
        });
        return;
      }

      // 2. Or Firestore fallback
      if (firebase.firestore) {
        const firestore = firebase.firestore();
        firestore.collection("restaurant").doc("menu").onSnapshot((doc) => {
          const loadingEl = document.getElementById('loadingState');
          const contentEl = document.getElementById('menuContent');

          if (doc.exists) {
            const data = doc.data();
            state.settings = data.settings || {};
            state.categories = data.categories || [];
            state.items = data.items || [];
            if (data.quickFilters) state.quickFilters = data.quickFilters;
            if (data.customDishOptions) state.customDishOptions = data.customDishOptions;

            applySettingsToUI();
            renderQuickFilterChips();
            renderCategoryNav();
            renderMenu();

            if (loadingEl) loadingEl.classList.add('hidden');
            if (contentEl) contentEl.classList.remove('hidden');
          } else {
            fetchMenuData();
          }
        }, (err) => {
          console.warn('Firestore read error, using local API:', err);
          fetchMenuData();
        });
        return;
      }
    } catch (e) {
      console.warn('Firebase init failed, using local API:', e);
    }
  }

  // Fallback to Express API
  fetchMenuData();
  setInterval(() => {
    fetchMenuData(true);
  }, 30000);
}

// Fetch Menu & Settings from Cloud / Server
async function fetchMenuData(isBackgroundSync = false) {
  const loadingEl = document.getElementById('loadingState');
  const contentEl = document.getElementById('menuContent');
  const cfg = window.FIREBASE_CONFIG;

  try {
    let data = null;

    // 1. Fetch directly from Firebase Cloud
    if (cfg && cfg.databaseURL) {
      try {
        const fbRes = await fetch(`${cfg.databaseURL}/menu.json?t=${Date.now()}`);
        const cloudData = await fbRes.json();
        if (cloudData && cloudData.items && cloudData.items.length) {
          data = {
            success: true,
            settings: cloudData.settings || {},
            categories: cloudData.categories || [],
            items: cloudData.items || [],
            quickFilters: cloudData.quickFilters || [],
            customDishOptions: cloudData.customDishOptions || []
          };
        }
      } catch (fbErr) {
        console.warn('Firebase direct load error:', fbErr);
      }
    }

    // 2. Fallback to Express API
    if (!data) {
      const res = await fetch('/api/menu?t=' + Date.now());
      data = await res.json();
    }

    if (data && data.success) {
      state.settings = data.settings || {};
      state.categories = data.categories || [];
      state.items = data.items || [];
      if (data.quickFilters) state.quickFilters = data.quickFilters;
      if (data.customDishOptions) state.customDishOptions = data.customDishOptions;

      applySettingsToUI();
      renderQuickFilterChips();
      renderCategoryNav();
      renderMenu();

      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
    } else {
      throw new Error(data ? data.message : 'Failed to load menu');
    }
  } catch (err) {
    console.error('Error fetching menu:', err);
    if (!isBackgroundSync && loadingEl) {
      loadingEl.innerHTML = `
        <div class="text-rose-600 bg-rose-50 p-6 rounded-3xl border border-rose-200 max-w-sm mx-auto">
          <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
          <p class="font-bold text-sm">Error connecting to menu server.</p>
          <button onclick="fetchMenuData()" class="mt-3 px-4 py-2 bg-[#dfb15b] text-[#0e2a22] rounded-xl font-bold text-xs shadow">Retry</button>
        </div>
      `;
    }
  }
}

// Manual Full Menu Refresh Trigger (Invoked by header refresh button)
function refreshMenu(e) {
  if (e && e.preventDefault) e.preventDefault();
  const icon = document.getElementById('headerRefreshIcon');
  if (icon) icon.classList.add('animate-spin');

  setTimeout(() => {
    window.location.reload();
  }, 200);
}

// Menu Toast Notification
function showMenuToast(msg, type = 'info') {
  let toast = document.getElementById('menuToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'menuToast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  if (type === 'success') {
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none bg-[#09221b] text-[#ffdaa9] border border-[#dfb15b]/40 opacity-100 translate-y-0';
  } else {
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none bg-stone-900 text-white border border-stone-700 opacity-100 translate-y-0';
  }

  setTimeout(() => {
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none opacity-0 translate-y-3';
  }, 2500);
}

// Apply Restaurant Info to UI
function applySettingsToUI() {
  const s = state.settings;
  if (s.restaurantName) {
    document.title = `${s.restaurantName} | Multi Cuisine Restaurant - Digital Menu`;
    const nameEl = document.getElementById('restaurantName');
    if (nameEl) nameEl.textContent = s.restaurantName;
  }
  if (s.tagline) {
    const tagEl = document.getElementById('restaurantTagline');
    if (tagEl) tagEl.textContent = s.tagline;
  }
  if (s.openTime && s.closeTime) {
    const timingEl = document.getElementById('timingStatus');
    if (timingEl) timingEl.textContent = `🔥 Welcome to ${s.restaurantName || 'La Mensa'} • Pure Taste & Greater Health • Open ${s.openTime} - ${s.closeTime}`;
  }

  // WiFi Info
  if (s.wifiName) {
    const wifiEl = document.getElementById('wifiNameDisplay');
    if (wifiEl) wifiEl.textContent = s.wifiName;
  }
  if (s.wifiPassword) {
    const wifiPassEl = document.getElementById('wifiPassDisplay');
    if (wifiPassEl) wifiPassEl.textContent = s.wifiPassword;
  }

  // QR Code Image (links to /menu)
  const qrImg = document.getElementById('menuQrImage');
  const qrLink = document.getElementById('downloadQrLink');
  const currentUrl = `${window.location.origin}/menu`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=09221b&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`;
  if (qrImg) qrImg.src = qrApiUrl;
  if (qrLink) qrLink.href = qrApiUrl;

  // Restaurant Brand Logo (Menu Header, Hero Crest [81x81], Footer)
  const logoUrl = s.logoUrl;
  const headerLogoEl = document.getElementById('headerLogoContainer');
  if (headerLogoEl) {
    if (logoUrl) {
      headerLogoEl.innerHTML = `<img src="${logoUrl}" alt="${s.restaurantName || 'Logo'}" class="w-full h-full object-cover" />`;
    } else {
      headerLogoEl.innerHTML = `
        <div class="w-full h-full rounded-t-[13px] rounded-b-sm border border-[#dfb15b]/30 flex flex-col items-center justify-center bg-gradient-to-b from-[#10352a] to-[#09221b] overflow-hidden">
          <i class="fa-solid fa-utensils text-[#dfb15b] text-[10px]"></i>
          <span class="text-[5px] font-serif font-bold text-[#ffdaa9] leading-tight">LM</span>
        </div>
      `;
    }
  }

  const heroLogoEl = document.getElementById('heroLogoContainer');
  if (heroLogoEl) {
    if (logoUrl) {
      heroLogoEl.innerHTML = `<img src="${logoUrl}" alt="${s.restaurantName || 'Logo'}" class="w-full h-full object-cover" />`;
    } else {
      heroLogoEl.innerHTML = `
        <div class="w-full h-full rounded-t-[23px] rounded-b-xl border border-[#dfb15b]/35 flex flex-col items-center justify-center bg-gradient-to-b from-[#10352a] to-[#09221b] overflow-hidden p-1 text-center">
          <i class="fa-solid fa-utensils text-[#dfb15b] text-base mb-1"></i>
          <span class="text-[7px] font-serif font-black tracking-widest text-[#ffdaa9] uppercase leading-none">LA MENSA</span>
        </div>
      `;
    }
  }

  const footerLogoEl = document.getElementById('footerLogoContainer');
  if (footerLogoEl) {
    if (logoUrl) {
      footerLogoEl.innerHTML = `<img src="${logoUrl}" alt="${s.restaurantName || 'Logo'}" class="w-full h-full object-cover" />`;
    } else {
      footerLogoEl.innerHTML = `
        <div class="w-full h-full rounded-t-[18px] rounded-b-lg border border-[#dfb15b]/35 flex flex-col items-center justify-center bg-gradient-to-b from-[#10352a] to-[#09221b] overflow-hidden p-0.5 text-center">
          <i class="fa-solid fa-utensils text-[#dfb15b] text-sm mb-0.5"></i>
          <span class="text-[6px] font-serif font-bold tracking-widest text-[#ffdaa9] uppercase leading-none">LA MENSA</span>
        </div>
      `;
    }
  }

  // Foodie Dining Assistant Bot Visibility
  const isBotEnabled = s && s.enableFoodieBot !== false;
  const botContainer = document.getElementById('foodieBotContainer');
  if (botContainer) {
    if (isBotEnabled) {
      botContainer.classList.remove('hidden');
      scheduleFoodieBotGreeting();
    } else {
      botContainer.classList.add('hidden');
    }
  }
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      const clearBtn = document.getElementById('clearSearchBtn');
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', state.searchQuery === '');
      }
      renderMenu();
    });
  }

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    const dishModal = document.getElementById('dishModal');
    if (e.target === dishModal) closeDishModal();
    const qrModal = document.getElementById('qrModal');
    if (e.target === qrModal) closeQrModal();
    const foodieModal = document.getElementById('foodieBotModal');
    if (e.target === foodieModal) closeFoodieBotModal();
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModal();
      closeQrModal();
      closeFoodieBotModal();
    }
  });
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    state.searchQuery = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderMenu();
  }
}

// Category Navigation Ribbon Scrolling
function scrollCatNav(delta) {
  const container = document.getElementById('categoryNavContainer');
  if (container) {
    container.scrollBy({ left: delta, behavior: 'smooth' });
  }
}

// Category Pills Navigation with Item Counts (Exact Match to Image 2)
function renderCategoryNav() {
  const container = document.getElementById('categoryNavContainer');
  if (!container) return;

  const visibleCategories = state.categories.filter(c => c.isShown !== false && !c.isHidden);
  const visibleCategoryIds = new Set(visibleCategories.map(c => c.id));
  const availableItems = state.items.filter(i => i.isAvailable !== false && visibleCategoryIds.has(i.categoryId));
  const totalCount = availableItems.length;

  if (state.activeCategory !== 'all' && !visibleCategoryIds.has(state.activeCategory)) {
    state.activeCategory = 'all';
  }

  let html = `
    <button onclick="filterByCategory('all')" class="cat-pill ${state.activeCategory === 'all' ? 'active bg-[#09221b] text-[#ffdaa9] font-bold border border-[#dfb15b]/40 shadow-sm' : 'bg-white text-stone-700 border border-[#e6e2d6] hover:bg-[#ffdaa9]/20 hover:border-[#dfb15b] font-semibold'} px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition shadow-xs">
      <span>All Dishes (${totalCount})</span>
    </button>
  `;

  visibleCategories.forEach(cat => {
    const catItemsCount = availableItems.filter(i => i.categoryId === cat.id).length;
    if (catItemsCount === 0) return; // Do not show empty categories

    const isActive = state.activeCategory === cat.id;
    html += `
      <button onclick="filterByCategory('${cat.id}')" class="cat-pill ${isActive ? 'active bg-[#09221b] text-[#ffdaa9] font-bold border border-[#dfb15b]/40 shadow-sm' : 'bg-white text-stone-700 border border-[#e6e2d6] hover:bg-[#ffdaa9]/20 hover:border-[#dfb15b] font-semibold'} px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition shadow-xs">
        <span>${cat.name} (${catItemsCount})</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

function filterByCategory(categoryId) {
  state.activeCategory = categoryId;
  renderCategoryNav();
  renderMenu();

  if (categoryId !== 'all') {
    const targetSection = document.getElementById(`cat-section-${categoryId}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// Search Bar Quick Filters (Dynamic from Admin / Cloud)
function getDefaultQuickFilters() {
  return [
    { id: 'all', name: 'All Dishes', desc: 'Shows all menu items', alwaysShown: true },
    { id: 'veg', name: '100% Veg', desc: 'Shows vegetarian items' },
    { id: 'jain', name: '🟡 Jain Available', desc: 'Shows Jain items' },
    { id: 'special', name: "Chef's Specials", desc: 'Signature items' },
    { id: 'bestseller', name: 'Bestsellers', desc: 'Most popular dishes' },
    { id: 'beverages', name: 'Mocktails & Beverages', desc: 'Cold & hot refreshments' },
    { id: 'desserts', name: 'Desserts', desc: 'Desserts & sweets' }
  ];
}

function renderQuickFilterChips() {
  const container = document.getElementById('quickFilterChipsContainer');
  if (!container) return;

  if (!state.quickFilters || !state.quickFilters.length) {
    state.quickFilters = getDefaultQuickFilters();
  }

  if (!state.activeQuickFilter) {
    state.activeQuickFilter = 'all';
  }

  container.innerHTML = state.quickFilters.map(f => {
    const isActive = state.activeQuickFilter === f.id;
    return `
      <button
        type="button"
        onclick="setQuickFilter('${f.id}')"
        id="qf-btn-${f.id}"
        class="quick-filter-btn diet-btn px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
          isActive
            ? 'active bg-[#ffdaa9] text-[#0d2d24] font-bold border border-[#dfb15b] shadow-sm'
            : 'bg-[#09221b] text-[#e8d8b9] border border-[#dfb15b]/30 hover:border-[#dfb15b]'
        }"
      >
        ${f.name}
      </button>
    `;
  }).join('');
}

function setQuickFilter(filterId) {
  state.activeQuickFilter = filterId;
  state.activeDietFilter = filterId;

  // Update button visual states
  document.querySelectorAll('.quick-filter-btn, .diet-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-[#ffdaa9]', 'text-[#0d2d24]', 'font-bold', 'border-[#dfb15b]', 'shadow-sm');
    btn.classList.add('bg-[#09221b]', 'text-[#e8d8b9]', 'border-[#dfb15b]/30');
  });

  const activeBtn = document.getElementById(`qf-btn-${filterId}`) || document.getElementById(`filter-${filterId}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-[#09221b]', 'text-[#e8d8b9]', 'border-[#dfb15b]/30');
    activeBtn.classList.add('active', 'bg-[#ffdaa9]', 'text-[#0d2d24]', 'font-bold', 'border-[#dfb15b]', 'shadow-sm');
  }

  renderMenu();
}

// Backwards compatibility alias
function setDietFilter(filterType) {
  setQuickFilter(filterType);
}

// Main Menu Renderer (Grouped by Category)
function renderMenu() {
  const container = document.getElementById('menuContent');
  const emptyState = document.getElementById('emptySearchState');
  if (!container) return;

  const currency = state.settings.currencySymbol || '₹';
  const visibleCategories = state.categories.filter(c => c.isShown !== false && !c.isHidden);
  const visibleCategoryIds = new Set(visibleCategories.map(c => c.id));

  // Filter items based on active criteria
  let filteredItems = state.items.filter(item => {
    // If out of stock, completely hide from customer menu
    if (item.isAvailable === false) {
      return false;
    }

    // If its category is hidden/unshown, completely hide from customer menu
    if (!visibleCategoryIds.has(item.categoryId)) {
      return false;
    }

    // Category match
    if (state.activeCategory !== 'all' && item.categoryId !== state.activeCategory) {
      return false;
    }

    // Search query match
    if (state.searchQuery) {
      const matchName = item.name.toLowerCase().includes(state.searchQuery);
      const matchDesc = (item.description || '').toLowerCase().includes(state.searchQuery);
      const matchCat = (item.categoryName || '').toLowerCase().includes(state.searchQuery);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // Dynamic Quick Filter matching
    const activeQfId = state.activeQuickFilter || state.activeDietFilter;
    if (activeQfId && activeQfId !== 'all') {
      const qf = (state.quickFilters || []).find(f => f.id === activeQfId);
      const qfName = (qf ? qf.name : activeQfId).toLowerCase().trim();
      const qfId = (qf ? qf.id : activeQfId).toLowerCase().trim();

      // Standard dietary flags
      if (qfId === 'veg' || (qfName.includes('veg') && !qfName.includes('non'))) {
        if (item.isVeg === false) return false;
      } else if (qfId === 'jain' || qfName.includes('jain')) {
        if (!item.isJain) return false;
      } else if (qfId === 'special' || qfName.includes('special') || qfName.includes('chef')) {
        if (!item.isChefSpecial) return false;
      } else if (qfId === 'bestseller' || qfName.includes('bestseller') || qfName.includes('popular')) {
        if (!item.isBestseller && !item.isChefSpecial) return false;
      } else if (qf && qf.categoryId && item.categoryId === qf.categoryId) {
        // Matched explicitly assigned categoryId
      } else {
        // Match by Category Name or ID
        const matchedCat = state.categories.find(c =>
          c.id.toLowerCase() === qfId ||
          c.name.toLowerCase() === qfName
        );

        if (matchedCat) {
          if (item.categoryId !== matchedCat.id) return false;
        } else {
          // Match by Custom Badges / Options
          const hasCustomOpt = Array.isArray(item.customOptions) && item.customOptions.some(opt => opt.toLowerCase() === qfName);
          const hasTag = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase() === qfName);

          // Keyword match in dish name, category name, or description
          const cleanWord = qfName.replace(/[^a-z0-9\s]/g, '').trim();
          const inName = item.name.toLowerCase().includes(cleanWord);
          const inCat = (item.categoryName || '').toLowerCase().includes(cleanWord);
          const inDesc = (item.description || '').toLowerCase().includes(cleanWord);

          if (!hasCustomOpt && !hasTag && !inName && !inCat && !inDesc) {
            return false;
          }
        }
      }
    }

    return true;
  });

  if (filteredItems.length === 0) {
    container.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Group items by category (only visible categories)
  let categoriesToDisplay = visibleCategories;
  if (state.activeCategory !== 'all') {
    categoriesToDisplay = visibleCategories.filter(c => c.id === state.activeCategory);
  }

  let html = '';

  categoriesToDisplay.forEach(cat => {
    const itemsInCat = filteredItems.filter(i => i.categoryId === cat.id);
    if (itemsInCat.length === 0) return;

    html += `
      <section id="cat-section-${cat.id}" class="scroll-mt-36">
        <!-- Category Section Header (Exact Match to Image 3) -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-[#dfb15b]/20">
          <div class="flex items-center gap-2.5">
            <span class="text-xl sm:text-2xl">${cat.icon || '🍽️'}</span>
            <div>
              <h3 class="text-xl sm:text-2xl font-serif font-bold text-[#0d2d24]">${cat.name}</h3>
              ${cat.subtitle || cat.description ? `<p class="text-xs text-[#5c6e67] mt-0.5">${cat.subtitle || cat.description}</p>` : ''}
            </div>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#5c6e67] border border-[#e6e2d6] shadow-xs">
            ${itemsInCat.length} ${itemsInCat.length === 1 ? 'Dish' : 'Dishes'}
          </span>
        </div>

        <!-- 2-Column Dish Cards Grid (Exact Match to Image 2 & 3) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          ${itemsInCat.map(item => renderDishCard(item, currency)).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;
}

// Single Dish Card Template (Exact Match to Screenshots 2 and 3)
function renderDishCard(item, currency) {
  return `
    <div onclick="openDishModal('${item.id}')" class="dish-card cursor-pointer rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 bg-white border border-[#e6e2d6] hover:border-[#dfb15b] hover:shadow-md group">
      
      <!-- Top Row: Veg Indicator + Title & Price -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="veg-indicator shrink-0" title="100% Pure Vegetarian"></span>
            <h4 class="font-bold text-base sm:text-[17px] text-[#0d2d24] group-hover:text-[#b8860b] transition leading-snug break-words">
              ${item.name}
            </h4>
          </div>
          <div class="text-right shrink-0">
            <div class="flex items-baseline justify-end gap-1.5">
              <span class="text-base sm:text-lg font-extrabold text-[#0d2d24]">
                ${currency}${item.price}
              </span>
              ${item.originalPrice ? `
                <span class="text-xs text-stone-400 line-through">
                  ${currency}${item.originalPrice}
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xs sm:text-[13px] text-[#5c6e67] leading-relaxed mb-4 line-clamp-2">
          ${item.description || 'Prepared fresh with finest ingredients.'}
        </p>
      </div>

      <!-- Bottom Row: Badges & View Details Link -->
      <div class="flex items-center justify-between gap-2 pt-2 border-t border-[#f7f5ef]">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${item.isJain ? `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
              🟡 Jain Option
            </span>
          ` : ''}

          ${item.isChefSpecial ? `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdaa9] text-[#0d2d24] border border-[#dfb15b]">
              ⭐ Chef's Special
            </span>
          ` : item.isBestseller ? `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              Popular
            </span>
          ` : ''}

          ${item.isSpicy || item.spiceLevel >= 2 ? `
            <span class="text-[10px] font-bold text-rose-600">🌶️ Spicy</span>
          ` : ''}

          ${(item.customOptions && Array.isArray(item.customOptions)) ? item.customOptions.map(opt => `
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-[#0d2d24] border border-stone-300">
              ${opt}
            </span>
          `).join('') : ''}
        </div>

        <button onclick="openDishModal('${item.id}'); event.stopPropagation();" class="text-xs font-bold text-[#0d2d24] group-hover:text-[#b8860b] flex items-center gap-1 shrink-0 transition">
          <span>View Details</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>

    </div>
  `;
}

// Dish Detail Modal
function openDishModal(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;

  const currency = state.settings.currencySymbol || '₹';

  const modal = document.getElementById('dishModal');
  const card = document.getElementById('dishModalCard');

  document.getElementById('modalDishImg').src = resolveDishImage(item);
  document.getElementById('modalDishName').textContent = item.name;
  document.getElementById('modalPrice').textContent = `${currency}${item.price}`;
  
  const origPriceEl = document.getElementById('modalOriginalPrice');
  if (origPriceEl) {
    if (item.originalPrice) {
      origPriceEl.textContent = `${currency}${item.originalPrice}`;
      origPriceEl.classList.remove('hidden');
    } else {
      origPriceEl.classList.add('hidden');
    }
  }

  
  const spiceLevels = ['Zero Spice', '🌶️ Mild Spice', '🌶️🌶️ Medium Spice', '🌶️🌶️🌶️ Extra Spicy'];
  document.getElementById('modalSpiceLevel').textContent = spiceLevels[item.spiceLevel || 0] || 'Mild';

  document.getElementById('modalDescription').textContent = item.description || 'Delicious handcrafted recipe prepared fresh upon request using premium quality ingredients.';

  // Badges
  let badgesHtml = '<span class="veg-indicator bg-white p-1 rounded shadow" title="Pure Veg"></span>';
  if (item.isJain) {
    badgesHtml += '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow">🟡 Jain Option</span>';
  }
  if (item.isChefSpecial) {
    badgesHtml += '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dfb15b] text-[#0e2a22] shadow">⭐ Chef\'s Special</span>';
  }
  if (!item.isAvailable) {
    badgesHtml += '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow">Sold Out Today</span>';
  }
  if (item.customOptions && Array.isArray(item.customOptions)) {
    item.customOptions.forEach(opt => {
      badgesHtml += `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-[#0d2d24] border border-stone-300 shadow">${opt}</span>`;
    });
  }
  document.getElementById('modalBadges').innerHTML = badgesHtml;

  // Tags
  let tagsHtml = '';
  if (item.tags && Array.isArray(item.tags)) {
    tagsHtml = item.tags.map(t => `<span class="px-2.5 py-1 rounded-lg bg-[#f7f5ef] border border-[#e6e2d6] text-[11px] font-medium text-[#0e2a22]">#${t}</span>`).join('');
  }
  document.getElementById('modalTagsContainer').innerHTML = tagsHtml;

  // Chef's Recommended Food Pairings
  renderDishModalPairings(item);

  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
}

// ==================== CHEF'S RECOMMENDED FOOD PAIRINGS ====================

function renderDishModalPairings(item) {
  const section = document.getElementById('modalPairingSection');
  const listEl = document.getElementById('modalPairingList');
  if (!section || !listEl) return;

  // Master switch check from admin settings (default is enabled unless explicitly false)
  if (state.settings && state.settings.enableSmartPairings === false) {
    section.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  const pairings = getSmartPairingsForDish(item);
  if (!pairings || !pairings.length) {
    section.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  const currency = state.settings.currencySymbol || '₹';
  listEl.innerHTML = pairings.map(pair => `
    <div onclick="openDishModal('${pair.id}')" class="p-2.5 rounded-xl bg-white border border-amber-200/90 hover:border-amber-400 hover:shadow-sm cursor-pointer transition flex items-center gap-2.5 group">
      <img src="${resolveDishImage(pair)}" class="w-12 h-12 rounded-lg object-cover border border-[#e6e2d6] shrink-0" alt="${pair.name}" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-1">
          <span class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition truncate">${pair.name}</span>
          <span class="text-xs font-extrabold text-[#0d2d24] shrink-0">${currency}${pair.price}</span>
        </div>
        <p class="text-[10px] text-stone-500 truncate mt-0.5">${pair.pairingReason || 'Perfect flavor companion'}</p>
      </div>
    </div>
  `).join('');

  section.classList.remove('hidden');
}

function getSmartPairingsForDish(item) {
  if (!item || !state.items || !state.items.length) return [];

  // Master toggle check
  if (state.settings && state.settings.enableSmartPairings === false) return [];

  // 1. Check for manual custom pairing set by admin
  if (item.pairingDishId) {
    const manualPair = state.items.find(i => i.id === item.pairingDishId && i.isAvailable !== false);
    if (manualPair) {
      return [{
        ...manualPair,
        pairingReason: "Chef's Handpicked Combination"
      }];
    }
  }

  // 2. Auto Smart Pairing Engine
  const allAvailable = state.items.filter(i => i.id !== item.id && i.isAvailable !== false);
  const isJainItem = Boolean(item.isJain);

  // Strictly respect Jain diet if current dish is Jain
  const matchDiet = (candidates) => {
    if (isJainItem) {
      return candidates.filter(c => c.isJain);
    }
    return candidates;
  };

  // Helper to match items by category keywords
  const findCategoryMatches = (keywords) => {
    const lowerKeys = keywords.map(k => k.toLowerCase());
    return allAvailable.filter(i => {
      const catObj = (state.categories || []).find(c => c.id === i.categoryId);
      const catName = (catObj ? catObj.name : (i.category || '')).toLowerCase();
      const catId = (i.categoryId || '').toLowerCase();
      return lowerKeys.some(k => catName.includes(k) || catId.includes(k));
    });
  };

  const currentCatObj = (state.categories || []).find(c => c.id === item.categoryId);
  const currentCatName = (currentCatObj ? currentCatObj.name : (item.category || '')).toLowerCase();
  const currentCatId = (item.categoryId || '').toLowerCase();

  const pairings = [];

  // Categorized pools with exact category IDs + fallback keywords
  const mocktails = matchDiet(findCategoryMatches(['cat-mocktails', 'mocktail', 'ice tea', 'iced tea', 'cooler', 'cat-soft-drinks']));
  const shakes = matchDiet(findCategoryMatches(['cat-shakes', 'frappe', 'shake']));
  const coffees = matchDiet(findCategoryMatches(['cat-coffee', 'coffee', 'artisan coffee', 'brews']));
  const starters = matchDiet(findCategoryMatches(['cat-titbits', 'cat-tandoor', 'cat-soups', 'cat-salads', 'starter', 'titbit']));
  const breads = matchDiet(findCategoryMatches(['cat-breads', 'tandoori bread', 'roti', 'naan']));
  const desserts = matchDiet(findCategoryMatches(['cat-desserts', 'dessert', 'treat', 'sweet']).filter(i => i.price >= 80));

  // Fallbacks
  const popularBeverages = matchDiet([...mocktails, ...shakes, ...coffees]);
  const popularSides = matchDiet([...starters, ...breads, ...desserts]);

  // CULINARY PAIRING RULES
  if (currentCatId.includes('pizza') || currentCatName.includes('pizza') || currentCatId.includes('pasta') || currentCatName.includes('pasta') || currentCatName.includes('risotto')) {
    // Pizzas & Pastas -> 1: Refreshing Mocktail/Iced Tea, 2: Garlic Bread / Starter
    if (mocktails.length) {
      const drink = pickBestCandidate(mocktails, item.id, 0);
      if (drink) pairings.push({ ...drink, pairingReason: 'Crisp tea/cooler balances rich cheese' });
    }
    if (starters.length) {
      const side = pickBestCandidate(starters, item.id, 1);
      if (side) pairings.push({ ...side, pairingReason: 'Crispy warm companion' });
    }
  } else if (currentCatId.includes('sizzler') || currentCatName.includes('sizzler') || currentCatId.includes('lebanese') || currentCatName.includes('lebanese') || (item.spiceLevel && item.spiceLevel >= 2)) {
    // Sizzlers / Spicy -> 1: Cooling Frappe/Shake/Mojito, 2: Sizzling Brownie / Dessert
    const pool = shakes.length ? shakes : mocktails;
    if (pool.length) {
      const drink = pickBestCandidate(pool, item.id, 0);
      if (drink) pairings.push({ ...drink, pairingReason: 'Cools the palate after hot sizzler spices' });
    }
    if (desserts.length) {
      const sweet = pickBestCandidate(desserts, item.id, 1);
      if (sweet) pairings.push({ ...sweet, pairingReason: 'The classic sweet finish' });
    }
  } else if (currentCatId.includes('main') || currentCatName.includes('indian') || currentCatName.includes('curry')) {
    // Indian Main Course -> 1: Tandoori Breads, 2: Cool Beverage or Dessert
    if (breads.length) {
      const bread = pickBestCandidate(breads, item.id, 0);
      if (bread) pairings.push({ ...bread, pairingReason: 'Fresh hot tandoori bread for gravies' });
    }
    const sweetPool = desserts.length ? desserts : mocktails;
    if (sweetPool.length) {
      const second = pickBestCandidate(sweetPool, item.id, 1);
      if (second) pairings.push({ ...second, pairingReason: 'Traditional satisfying complement' });
    }
  } else if (currentCatId.includes('fondue') || currentCatName.includes('fondue') || currentCatName.includes('mexican') || currentCatId.includes('chinese') || currentCatName.includes('chinese') || currentCatName.includes('asian')) {
    // Mexican & Asian -> 1: Citrus Mocktail, 2: Crunchy Starter / Dimsum
    if (mocktails.length) {
      const drink = pickBestCandidate(mocktails, item.id, 0);
      if (drink) pairings.push({ ...drink, pairingReason: 'Tangy blend pairing with spices' });
    }
    if (starters.length) {
      const starter = pickBestCandidate(starters, item.id, 1);
      if (starter) pairings.push({ ...starter, pairingReason: 'Crispy appetizer companion' });
    }
  } else if (currentCatId.includes('dessert') || currentCatName.includes('dessert')) {
    // Desserts -> Hot Artisan Coffee / Brew
    if (coffees.length) {
      const coffee = pickBestCandidate(coffees, item.id, 0);
      if (coffee) pairings.push({ ...coffee, pairingReason: 'Warm artisanal roast balances sweetness' });
    }
  } else if (currentCatName.includes('coffee') || currentCatName.includes('mocktail') || currentCatName.includes('shake') || currentCatName.includes('drink')) {
    // Drinks -> Starter or Dessert
    if (desserts.length) {
      const dessert = pickBestCandidate(desserts, item.id, 0);
      if (dessert) pairings.push({ ...dessert, pairingReason: 'Sweet treat with your beverage' });
    } else if (starters.length) {
      const starter = pickBestCandidate(starters, item.id, 0);
      if (starter) pairings.push({ ...starter, pairingReason: 'Crisp bite to accompany drink' });
    }
  } else {
    // General items
    if (popularBeverages.length) {
      const drink = pickBestCandidate(popularBeverages, item.id, 0);
      if (drink) pairings.push({ ...drink, pairingReason: 'Chef recommended thirst quencher' });
    }
    if (popularSides.length) {
      const side = pickBestCandidate(popularSides, item.id, 1);
      if (side) pairings.push({ ...side, pairingReason: 'Favorite dining companion' });
    }
  }

  // Deduplicate and return max 2 items
  const seenIds = new Set();
  return pairings.filter(p => {
    if (!p || !p.id || seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  }).slice(0, 2);
}

function pickBestCandidate(candidates, seedString, salt = 0) {
  if (!candidates || !candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => (b.isChefSpecial ? 1 : 0) - (a.isChefSpecial ? 1 : 0));
  let hash = 0;
  const str = String(seedString || 'seed');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i) + salt;
    hash |= 0;
  }
  const index = Math.abs(hash) % sorted.length;
  return sorted[index];
}

function closeDishModal() {
  const modal = document.getElementById('dishModal');
  const card = document.getElementById('dishModalCard');
  if (!modal) return;

  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

// WiFi Modal
function openWifiModal() {
  document.getElementById('wifiModal').classList.remove('hidden');
}
function closeWifiModal() {
  document.getElementById('wifiModal').classList.add('hidden');
}

// QR Code Modal
function openQrModal() {
  document.getElementById('qrModal').classList.remove('hidden');
}
function closeQrModal() {
  document.getElementById('qrModal').classList.add('hidden');
}

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-800 text-emerald-100' : 'bg-[#0e2a22] text-[#ffdaa9]';
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

  toast.className = `${bg} px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 animate-toast pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==================== 10. CHEF'S FOODIE ASSISTANT BOT ====================

const foodieBotState = {
  isOpen: false,
  step: 1, // 1: Mood, 2: Diet, 3: Hunger, 4: Result
  selectedMood: null,
  selectedDiet: 'all',
  selectedHunger: 'meal',
  greetingTimer: null,
  hasShownGreeting: false
};

function scheduleFoodieBotGreeting() {
  if (foodieBotState.hasShownGreeting) return;
  const bubble = document.getElementById('foodieBotGreetingBubble');
  if (!bubble) return;
  if (sessionStorage.getItem('dismissedFoodieBotGreeting')) return;

  if (foodieBotState.greetingTimer) clearTimeout(foodieBotState.greetingTimer);

  foodieBotState.greetingTimer = setTimeout(() => {
    if (!foodieBotState.isOpen && (!state.settings || state.settings.enableFoodieBot !== false)) {
      bubble.classList.remove('hidden');
      foodieBotState.hasShownGreeting = true;
    }
  }, 3500);
}

function dismissFoodieBotGreeting(e) {
  if (e) e.stopPropagation();
  const bubble = document.getElementById('foodieBotGreetingBubble');
  if (bubble) bubble.classList.add('hidden');
  sessionStorage.setItem('dismissedFoodieBotGreeting', 'true');
}

function toggleFoodieBotModal() {
  if (foodieBotState.isOpen) {
    closeFoodieBotModal();
  } else {
    openFoodieBotModal();
  }
}

function openFoodieBotModal() {
  dismissFoodieBotGreeting();
  foodieBotState.isOpen = true;
  const modal = document.getElementById('foodieBotModal');
  const card = document.getElementById('foodieBotCard');
  if (!modal) return;

  renderFoodieBotCurrentStep();
  modal.classList.remove('hidden');

  if (card) {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }
}

function closeFoodieBotModal() {
  foodieBotState.isOpen = false;
  const modal = document.getElementById('foodieBotModal');
  const card = document.getElementById('foodieBotCard');
  if (!modal) return;

  if (card) {
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
  }
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

function resetFoodieBotQuiz() {
  foodieBotState.step = 1;
  foodieBotState.selectedMood = null;
  foodieBotState.selectedDiet = 'all';
  foodieBotState.selectedHunger = 'meal';
  renderFoodieBotCurrentStep();
}

function setFoodieBotMood(mood) {
  foodieBotState.selectedMood = mood;
  foodieBotState.step = 2;
  renderFoodieBotCurrentStep();
}

function setFoodieBotDiet(diet) {
  foodieBotState.selectedDiet = diet;
  foodieBotState.step = 3;
  renderFoodieBotCurrentStep();
}

function setFoodieBotHunger(hunger) {
  foodieBotState.selectedHunger = hunger;
  foodieBotState.step = 4;
  renderFoodieBotCurrentStep();
}

function setFoodieBotStep(stepNum) {
  foodieBotState.step = stepNum;
  renderFoodieBotCurrentStep();
}

function renderFoodieBotCurrentStep() {
  const body = document.getElementById('foodieBotBody');
  if (!body) return;

  if (foodieBotState.step === 1) {
    body.innerHTML = `
      <div class="space-y-4">
        <!-- Progress Indicator -->
        <div class="flex items-center justify-between text-[11px] font-bold text-stone-400">
          <span class="text-[#0d2d24] font-extrabold flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-[#0d2d24] text-[#ffdaa9] flex items-center justify-center text-[10px]">1</span>
            Flavor Mood
          </span>
          <span class="flex items-center gap-1">Step 1 of 3</span>
        </div>

        <div class="text-center space-y-1">
          <h4 class="font-serif font-bold text-lg text-[#0d2d24]">What are you craving today? ✨</h4>
          <p class="text-xs text-stone-500">Pick your favorite craving and Chef will curate the best recipe!</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button type="button" onclick="setFoodieBotMood('cheesy')" class="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/90 hover:border-amber-400 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs hover:shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition">🧀</span>
              <div class="min-w-0">
                <div class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition">Cheesy & Italian Comfort</div>
                <div class="text-[10px] text-stone-500 mt-0.5 truncate">Brick-Oven Pizza, Pastas & Fondue</div>
              </div>
            </div>
          </button>

          <button type="button" onclick="setFoodieBotMood('spicy')" class="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/50 border border-rose-200/90 hover:border-rose-400 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs hover:shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition">🌶️</span>
              <div class="min-w-0">
                <div class="font-bold text-xs text-[#0d2d24] group-hover:text-rose-800 transition">Hot, Spicy & Sizzling</div>
                <div class="text-[10px] text-stone-500 mt-0.5 truncate">Sizzlers, Mexican, Schezwan & Tandoor</div>
              </div>
            </div>
          </button>

          <button type="button" onclick="setFoodieBotMood('light')" class="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 hover:border-emerald-400 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs hover:shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition">🥗</span>
              <div class="min-w-0">
                <div class="font-bold text-xs text-[#0d2d24] group-hover:text-emerald-800 transition">Light, Crispy & Healthy</div>
                <div class="text-[10px] text-stone-500 mt-0.5 truncate">Soups, Fresh Salads, Titbits & Starters</div>
              </div>
            </div>
          </button>

          <button type="button" onclick="setFoodieBotMood('sweet_drinks')" class="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-purple-50/50 border border-purple-200/90 hover:border-purple-400 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs hover:shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition">☕</span>
              <div class="min-w-0">
                <div class="font-bold text-xs text-[#0d2d24] group-hover:text-purple-800 transition">Sips, Shakes & Sweets</div>
                <div class="text-[10px] text-stone-500 mt-0.5 truncate">Signature Mocktails, Coffee & Desserts</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    `;
  } else if (foodieBotState.step === 2) {
    body.innerHTML = `
      <div class="space-y-4">
        <!-- Progress Indicator -->
        <div class="flex items-center justify-between text-[11px] font-bold text-stone-400">
          <button type="button" onclick="setFoodieBotStep(1)" class="text-stone-500 hover:text-[#0d2d24] font-semibold flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-arrow-left text-[10px]"></i> Back
          </button>
          <span class="text-[#0d2d24] font-extrabold flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-[#0d2d24] text-[#ffdaa9] flex items-center justify-center text-[10px]">2</span>
            Dietary Choice
          </span>
          <span class="flex items-center gap-1">Step 2 of 3</span>
        </div>

        <div class="text-center space-y-1">
          <h4 class="font-serif font-bold text-lg text-[#0d2d24]">Any dietary restrictions? 🌿</h4>
          <p class="text-xs text-stone-500">We guarantee only matching certified preparations.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button type="button" onclick="setFoodieBotDiet('all')" class="p-4 rounded-2xl bg-[#faf9f5] border-2 border-emerald-300 hover:border-emerald-600 text-left transition transform active:scale-98 cursor-pointer group shadow-xs">
            <div class="flex items-center gap-3">
              <span class="text-3xl p-2 rounded-xl bg-emerald-50 text-emerald-700 shadow-2xs">🟢</span>
              <div class="min-w-0">
                <div class="font-bold text-sm text-[#0d2d24] group-hover:text-emerald-800 transition">Pure Vegetarian</div>
                <div class="text-xs text-stone-500 mt-0.5">All 100% pure veg recipes</div>
              </div>
            </div>
          </button>

          <button type="button" onclick="setFoodieBotDiet('jain')" class="p-4 rounded-2xl bg-[#faf9f5] border-2 border-amber-300 hover:border-amber-600 text-left transition transform active:scale-98 cursor-pointer group shadow-xs">
            <div class="flex items-center gap-3">
              <span class="text-3xl p-2 rounded-xl bg-amber-50 text-amber-800 shadow-2xs">🟡</span>
              <div class="min-w-0">
                <div class="font-bold text-sm text-[#0d2d24] group-hover:text-amber-800 transition">Strictly Jain Only</div>
                <div class="text-xs text-stone-500 mt-0.5">No onion, garlic, or root vegetables</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    `;
  } else if (foodieBotState.step === 3) {
    body.innerHTML = `
      <div class="space-y-4">
        <!-- Progress Indicator -->
        <div class="flex items-center justify-between text-[11px] font-bold text-stone-400">
          <button type="button" onclick="setFoodieBotStep(2)" class="text-stone-500 hover:text-[#0d2d24] font-semibold flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-arrow-left text-[10px]"></i> Back
          </button>
          <span class="text-[#0d2d24] font-extrabold flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-[#0d2d24] text-[#ffdaa9] flex items-center justify-center text-[10px]">3</span>
            Portion & Appetite
          </span>
          <span class="flex items-center gap-1">Step 3 of 3</span>
        </div>

        <div class="text-center space-y-1">
          <h4 class="font-serif font-bold text-lg text-[#0d2d24]">What is your appetite level? 🍽️</h4>
          <p class="text-xs text-stone-500">Tell Chef what portion fits your table right now.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button type="button" onclick="setFoodieBotHunger('meal')" class="p-3.5 rounded-2xl bg-[#faf9f5] border border-amber-200/90 hover:border-amber-500 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs">
            <span class="text-2xl block mb-2">🍲</span>
            <div class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition">Full Hearty Meal</div>
            <div class="text-[10px] text-stone-500 mt-0.5">Main courses, pizzas or sizzlers</div>
          </button>

          <button type="button" onclick="setFoodieBotHunger('bites')" class="p-3.5 rounded-2xl bg-[#faf9f5] border border-amber-200/90 hover:border-amber-500 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs">
            <span class="text-2xl block mb-2">🥟</span>
            <div class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition">Quick Bites & Snacks</div>
            <div class="text-[10px] text-stone-500 mt-0.5">Starters, titbits & small plates</div>
          </button>

          <button type="button" onclick="setFoodieBotHunger('drinks')" class="p-3.5 rounded-2xl bg-[#faf9f5] border border-amber-200/90 hover:border-amber-500 text-left transition transform active:scale-98 cursor-pointer group shadow-2xs">
            <span class="text-2xl block mb-2">🍹</span>
            <div class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition">Chilled Sips / Dessert</div>
            <div class="text-[10px] text-stone-500 mt-0.5">Beverages, coolers & sweets</div>
          </button>
        </div>
      </div>
    `;
  } else if (foodieBotState.step === 4) {
    renderFoodieBotResult(body);
  }
}

function renderFoodieBotResult(body) {
  const matchResult = computeFoodieBotRecommendation();
  const matchedDish = matchResult.dish;
  const pairedDish = matchResult.pairedDish;
  const reason = matchResult.reason;
  const currency = (state.settings && state.settings.currencySymbol) || '₹';

  if (!matchedDish) {
    body.innerHTML = `
      <div class="text-center py-8 space-y-3">
        <div class="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-2xl">
          👨‍🍳
        </div>
        <h4 class="font-serif font-bold text-base text-[#0d2d24]">No exact match found</h4>
        <p class="text-xs text-stone-500 max-w-xs mx-auto">Try picking a broader mood or explore our complete multi-cuisine menu.</p>
        <button type="button" onclick="resetFoodieBotQuiz()" class="px-5 py-2.5 rounded-xl bg-[#0d2d24] text-[#ffdaa9] font-bold text-xs cursor-pointer shadow">
          Try Another Choice
        </button>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div class="space-y-4">
      <!-- Top Success Header -->
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
          <i class="fa-solid fa-sparkles text-amber-500"></i>
          <span>Chef's Perfect Match For You</span>
        </span>
        <button type="button" onclick="resetFoodieBotQuiz()" class="text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer flex items-center gap-1">
          <i class="fa-solid fa-rotate-right text-[10px]"></i>
          <span>Restart</span>
        </button>
      </div>

      <!-- Main Recommended Dish Card -->
      <div class="p-4 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-[#dfb15b] shadow-md space-y-3">
        <div class="flex gap-3.5">
          <img
            src="${resolveDishImage(matchedDish)}"
            alt="${matchedDish.name}"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-[#e6e2d6] shadow-inner shrink-0"
          />
          <div class="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap mb-1">
                ${matchedDish.isJain ? `
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    🟡 Jain
                  </span>
                ` : ''}
                ${matchedDish.isChefSpecial ? `
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ffdaa9] text-[#0d2d24] border border-[#dfb15b]">
                    ⭐ Chef's Special
                  </span>
                ` : matchedDish.isBestseller ? `
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Popular
                  </span>
                ` : ''}
                ${matchedDish.spiceLevel >= 2 ? `<span class="text-[9px] font-bold text-rose-600">🌶️ Spicy</span>` : ''}
              </div>

              <h4 class="font-serif font-bold text-base sm:text-lg text-[#0d2d24] leading-tight">
                ${matchedDish.name}
              </h4>
              <p class="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                ${matchedDish.description || 'Prepared fresh with finest ingredients.'}
              </p>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-[#f0eee6]">
              <span class="font-serif font-black text-base text-[#0d2d24]">
                ${currency}${matchedDish.price}
              </span>
              <button
                type="button"
                onclick="closeFoodieBotModal(); openDishModal('${matchedDish.id}');"
                class="px-3.5 py-1.5 rounded-xl bg-[#0d2d24] hover:bg-[#153f33] text-[#ffdaa9] font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
              >
                <span>View Dish</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Why Chef Picked This -->
        <div class="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 text-xs text-stone-700 flex items-start gap-2">
          <span class="text-sm shrink-0">💡</span>
          <p class="text-[11px] leading-snug">
            <span class="font-bold text-[#0d2d24]">Why this dish:</span> ${reason}
          </p>
        </div>
      </div>

      <!-- Recommended Complementary Pairing (if available) -->
      ${pairedDish ? `
        <div class="space-y-2 pt-1">
          <div class="flex items-center gap-1.5 text-xs font-serif font-bold text-[#0d2d24]">
            <span class="text-amber-600">✨</span>
            <span>Recommended Pairing With This:</span>
          </div>
          <div
            onclick="closeFoodieBotModal(); openDishModal('${pairedDish.id}');"
            class="p-3 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 cursor-pointer transition flex items-center gap-3 group shadow-2xs hover:shadow-sm"
          >
            <img
              src="${resolveDishImage(pairedDish)}"
              alt="${pairedDish.name}"
              class="w-12 h-12 rounded-xl object-cover border border-[#e6e2d6] shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="font-bold text-xs text-[#0d2d24] group-hover:text-amber-800 transition truncate">
                  ${pairedDish.name}
                </span>
                <span class="text-xs font-extrabold text-[#0d2d24] shrink-0">
                  ${currency}${pairedDish.price}
                </span>
              </div>
              <p class="text-[10px] text-stone-500 truncate mt-0.5">
                ${pairedDish.pairingReason || 'Perfect beverage / dessert companion'}
              </p>
            </div>
            <i class="fa-solid fa-arrow-right text-xs text-stone-400 group-hover:text-amber-800 transition shrink-0"></i>
          </div>
        </div>
      ` : ''}

      <!-- Bottom Actions -->
      <div class="pt-2 flex items-center justify-between gap-2 border-t border-[#f0eee6]">
        <button
          type="button"
          onclick="resetFoodieBotQuiz()"
          class="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer text-center"
        >
          Try Another Vibe
        </button>
        <button
          type="button"
          onclick="closeFoodieBotModal()"
          class="flex-1 py-2.5 rounded-xl bg-[#0d2d24] hover:bg-[#153f33] text-[#ffdaa9] font-bold text-xs transition cursor-pointer text-center"
        >
          Explore Full Menu
        </button>
      </div>

    </div>
  `;
}

function computeFoodieBotRecommendation() {
  if (!state.items || !state.items.length) {
    return { dish: null, pairedDish: null, reason: '' };
  }

  const { selectedMood, selectedDiet, selectedHunger } = foodieBotState;
  const isJainOnly = selectedDiet === 'jain';

  // 1. Available items matching diet
  let candidates = state.items.filter(i => {
    if (i.isAvailable === false) return false;
    if (isJainOnly && !i.isJain) return false;
    return true;
  });

  if (!candidates.length) {
    return { dish: null, pairedDish: null, reason: '' };
  }

  // 2. Map category keywords / IDs
  const matchCategory = (items, categoryIds) => {
    return items.filter(item => {
      const catId = (item.categoryId || '').toLowerCase();
      const catObj = (state.categories || []).find(c => c.id === item.categoryId);
      const catName = (catObj ? catObj.name : '').toLowerCase();
      return categoryIds.some(cid => catId.includes(cid.toLowerCase()) || catName.includes(cid.toLowerCase()));
    });
  };

  let targetCategories = [];
  let moodReason = '';

  if (selectedMood === 'cheesy') {
    moodReason = 'Handcrafted cheesy goodness loaded with rich authentic flavors.';
    if (selectedHunger === 'meal') {
      targetCategories = ['cat-pizza', 'cat-pasta', 'cat-fondue-mexican', 'pizza', 'pasta', 'fondue'];
    } else if (selectedHunger === 'bites') {
      targetCategories = ['cat-fondue-mexican', 'cat-titbits', 'fondue', 'starter', 'titbit'];
    } else {
      targetCategories = ['cat-shakes', 'cat-coffee', 'cat-desserts', 'shake', 'dessert'];
    }
  } else if (selectedMood === 'spicy') {
    moodReason = 'Sizzling spicy spices cooked to perfection with signature chef herbs.';
    if (selectedHunger === 'meal') {
      targetCategories = ['cat-lebanese-sizzler', 'cat-main', 'cat-chinese', 'sizzler', 'main course', 'chinese'];
    } else if (selectedHunger === 'bites') {
      targetCategories = ['cat-tandoor', 'cat-chinese', 'cat-titbits', 'tandoor', 'starter'];
    } else {
      targetCategories = ['cat-mocktails', 'cat-shakes', 'mocktail', 'shake'];
    }
  } else if (selectedMood === 'light') {
    moodReason = 'Wholesome, fresh and delightfully crisp on the palate.';
    if (selectedHunger === 'meal') {
      targetCategories = ['cat-pasta', 'cat-chinese', 'cat-dal-rice', 'pasta', 'rice'];
    } else if (selectedHunger === 'bites') {
      targetCategories = ['cat-soups', 'cat-salads', 'cat-titbits', 'soup', 'salad', 'starter'];
    } else {
      targetCategories = ['cat-mocktails', 'cat-coffee', 'mocktail', 'coffee'];
    }
  } else if (selectedMood === 'sweet_drinks') {
    moodReason = 'Decadent sweet indulgence and signature handcrafted refreshments.';
    targetCategories = ['cat-desserts', 'cat-shakes', 'cat-mocktails', 'cat-coffee', 'dessert', 'shake', 'coffee'];
  }

  let pool = matchCategory(candidates, targetCategories);
  if (!pool.length) {
    if (selectedMood === 'spicy') {
      pool = candidates.filter(i => i.spiceLevel && i.spiceLevel >= 2);
    }
  }
  if (!pool.length) pool = candidates;

  // Rank pool by Chef Special, Bestseller, and image presence
  pool.sort((a, b) => {
    const scoreA = (a.isChefSpecial ? 4 : 0) + (a.isBestseller ? 2 : 0) + (a.image ? 1 : 0);
    const scoreB = (b.isChefSpecial ? 4 : 0) + (b.isBestseller ? 2 : 0) + (b.image ? 1 : 0);
    return scoreB - scoreA;
  });

  // Pick top candidate
  const matchedDish = pool[0];

  // Pick complementary pairing dish
  let pairedDish = null;
  const pairings = getSmartPairingsForDish(matchedDish);
  if (pairings && pairings.length) {
    pairedDish = pairings[0];
  }

  return {
    dish: matchedDish,
    pairedDish,
    reason: moodReason
  };
}
