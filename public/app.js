// Global App State (View Only)
const state = {
  settings: {},
  categories: [],
  items: [],
  activeCategory: 'all',
  activeDietFilter: 'all', // 'all', 'jain', 'bestseller', 'spicy'
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

            applySettingsToUI();
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

            applySettingsToUI();
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

// Fetch Menu & Settings from Express API
async function fetchMenuData(isBackgroundSync = false) {
  const loadingEl = document.getElementById('loadingState');
  const contentEl = document.getElementById('menuContent');

  try {
    const res = await fetch('/api/menu?t=' + Date.now());
    const data = await res.json();

    if (data.success) {
      state.settings = data.settings || {};
      state.categories = data.categories || [];
      state.items = data.items || [];

      applySettingsToUI();
      renderCategoryNav();
      renderMenu();

      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
    } else {
      throw new Error(data.message || 'Failed to load menu');
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

  // QR Code Image
  const qrImg = document.getElementById('menuQrImage');
  const qrLink = document.getElementById('downloadQrLink');
  const currentUrl = window.location.origin;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0e2a22&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`;
  if (qrImg) qrImg.src = qrApiUrl;
  if (qrLink) qrLink.href = qrApiUrl;
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
    const wifiModal = document.getElementById('wifiModal');
    if (e.target === wifiModal) closeWifiModal();
    const qrModal = document.getElementById('qrModal');
    if (e.target === qrModal) closeQrModal();
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModal();
      closeWifiModal();
      closeQrModal();
    }
  });
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    state.searchQuery = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    renderMenu();
  }
}

// Category Pills Navigation
function renderCategoryNav() {
  const container = document.getElementById('categoryNavContainer');
  if (!container) return;

  let html = `
    <button onclick="filterByCategory('all')" class="cat-pill ${state.activeCategory === 'all' ? 'active' : 'bg-white text-stone-700 border border-[#e6e2d6] hover:bg-[#ffdaa9]/30'} px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm">
      <span>✨ All</span>
    </button>
  `;

  state.categories.forEach(cat => {
    const isActive = state.activeCategory === cat.id;
    html += `
      <button onclick="filterByCategory('${cat.id}')" class="cat-pill ${isActive ? 'active' : 'bg-white text-stone-700 border border-[#e6e2d6] hover:bg-[#ffdaa9]/30'} px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm">
        <span>${cat.icon || '🍽️'}</span>
        <span>${cat.name}</span>
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

// Dietary Filters (All, Jain Available, Chef's Special, Spicy Delights)
function setDietFilter(filterType) {
  state.activeDietFilter = filterType;

  // Update button visual states
  document.querySelectorAll('.diet-btn').forEach(btn => {
    btn.classList.remove('bg-[#dfb15b]', 'text-[#0e2a22]', 'font-bold', 'border-[#dfb15b]');
    btn.classList.add('bg-white', 'text-[#1c2c26]', 'border-[#dcd7c9]');
  });

  const activeBtn = document.getElementById(`filter-${filterType}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white', 'text-[#1c2c26]', 'border-[#dcd7c9]');
    activeBtn.classList.add('bg-[#dfb15b]', 'text-[#0e2a22]', 'font-bold', 'border-[#dfb15b]');
  }

  renderMenu();
}

// Main Menu Renderer (Grouped by Category)
function renderMenu() {
  const container = document.getElementById('menuContent');
  const emptyState = document.getElementById('emptySearchState');
  if (!container) return;

  const currency = state.settings.currencySymbol || '₹';

  // Filter items based on active criteria
  let filteredItems = state.items.filter(item => {
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

    // Diet filter match
    if (state.activeDietFilter === 'jain' && !item.isJain) return false;
    if (state.activeDietFilter === 'bestseller' && !item.isBestseller && !item.isChefSpecial) return false;
    if (state.activeDietFilter === 'spicy' && !item.isSpicy && item.spiceLevel < 2) return false;

    return true;
  });

  if (filteredItems.length === 0) {
    container.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Group items by category
  let categoriesToDisplay = state.categories;
  if (state.activeCategory !== 'all') {
    categoriesToDisplay = state.categories.filter(c => c.id === state.activeCategory);
  }

  let html = '';

  categoriesToDisplay.forEach(cat => {
    const itemsInCat = filteredItems.filter(i => i.categoryId === cat.id);
    if (itemsInCat.length === 0) return;

    html += `
      <section id="cat-section-${cat.id}" class="scroll-mt-32">
        <!-- Category Section Header -->
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-[#e6e2d6]">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${cat.icon || '🍽️'}</span>
            <div>
              <h3 class="text-xl sm:text-2xl font-serif font-bold text-[#0e2a22]">${cat.name}</h3>
              ${cat.subtitle || cat.description ? `<p class="text-xs text-[#5c6e67] mt-0.5">${cat.subtitle || cat.description}</p>` : ''}
            </div>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#5c6e67] border border-[#e6e2d6] shadow-sm">
            ${itemsInCat.length} ${itemsInCat.length === 1 ? 'Dish' : 'Dishes'}
          </span>
        </div>

        <!-- Dishes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          ${itemsInCat.map(item => renderDishCard(item, currency)).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;
}

// Single Dish Card Template (View-Only, Luxury Light Aesthetic)
function renderDishCard(item, currency) {
  const isAvailable = item.isAvailable !== false;

  return `
    <div onclick="openDishModal('${item.id}')" class="dish-card cursor-pointer rounded-2xl p-4 flex gap-4 relative overflow-hidden transition-all duration-300 ${!isAvailable ? 'opacity-65 grayscale-[30%]' : ''}">
      
      <!-- Left Content -->
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <!-- Badges Bar -->
          <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span class="veg-indicator" title="100% Pure Vegetarian"></span>
            
            ${item.isJain ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300" title="Jain Preparation Available">
                🟡 Jain Option
              </span>
            ` : ''}

            ${item.isChefSpecial ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdaa9] text-[#0e2a22] border border-[#dfb15b]">
                ⭐ Chef's Special
              </span>
            ` : item.isBestseller ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                Popular
              </span>
            ` : ''}

            ${item.isSpicy || item.spiceLevel >= 2 ? `
              <span class="text-[10px] font-bold text-rose-600" title="Spicy">🌶️ Spicy</span>
            ` : ''}
          </div>

          <!-- Dish Title -->
          <h4 class="font-bold text-base text-[#0e2a22] group-hover:text-[#a17a2b] transition leading-snug line-clamp-1">
            ${item.name}
          </h4>
          
          <!-- Description -->
          <p class="text-xs text-[#5c6e67] mt-1 line-clamp-2 leading-relaxed">
            ${item.description || 'Prepared fresh with finest ingredients.'}
          </p>
        </div>

        <!-- Price & Details Tag -->
        <div class="mt-3.5 flex items-center justify-between">
          <div class="flex items-baseline gap-1.5">
            <span class="text-lg font-extrabold text-[#0e2a22]">
              ${currency}${item.price}
            </span>
            ${item.originalPrice ? `
              <span class="text-xs text-stone-400 line-through">
                ${currency}${item.originalPrice}
              </span>
            ` : ''}
          </div>
          
          <div class="flex items-center gap-1 text-[11px] font-semibold text-[#8c9c94]">
            <span>View info</span>
            <i class="fa-solid fa-angle-right text-[10px]"></i>
          </div>
        </div>
      </div>

      <!-- Right Image -->
      <div class="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden bg-[#f7f5ef] shrink-0 relative border border-[#e6e2d6] shadow-sm">
        <img 
          src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" 
          alt="${item.name}" 
          loading="lazy"
          class="w-full h-full object-cover transition duration-300 hover:scale-105"
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'"
        />
        ${!isAvailable ? `
          <div class="absolute inset-0 bg-[#0e2a22]/75 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
            <span class="text-[11px] font-bold text-white bg-rose-600/90 px-2 py-0.5 rounded-full shadow">Sold Out</span>
          </div>
        ` : ''}
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

  document.getElementById('modalDishImg').src = item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
  document.getElementById('modalDishName').textContent = item.name;
  document.getElementById('modalPrice').textContent = `${currency}${item.price}`;
  
  const origPriceEl = document.getElementById('modalOriginalPrice');
  if (item.originalPrice) {
    origPriceEl.textContent = `${currency}${item.originalPrice}`;
    origPriceEl.classList.remove('hidden');
  } else {
    origPriceEl.classList.add('hidden');
  }

  document.getElementById('modalPortion').innerHTML = `<i class="fa-solid fa-plate-wheat mr-1 text-[#dfb15b]"></i> ${item.portion || 'Serves 1-2'}`;
  document.getElementById('modalPrepTime').innerHTML = `<i class="fa-regular fa-clock mr-1 text-[#dfb15b]"></i> ${item.prepTime || '15 mins'}`;
  
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
  document.getElementById('modalBadges').innerHTML = badgesHtml;

  // Tags
  let tagsHtml = '';
  if (item.tags && Array.isArray(item.tags)) {
    tagsHtml = item.tags.map(t => `<span class="px-2.5 py-1 rounded-lg bg-[#f7f5ef] border border-[#e6e2d6] text-[11px] font-medium text-[#0e2a22]">#${t}</span>`).join('');
  }
  document.getElementById('modalTagsContainer').innerHTML = tagsHtml;

  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 10);
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
