const fs = require('fs');
const path = require('path');

const vercelItems = JSON.parse(fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\907d8e8b-2f21-4e7c-ba02-47c30bff6758\\scratch\\vercel_items_full.json', 'utf-8'));
const vercelParsed = JSON.parse(fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\907d8e8b-2f21-4e7c-ba02-47c30bff6758\\scratch\\vercel_parsed.json', 'utf-8'));

// Curated image map for food categories
const categoryImages = {
  'Soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'Salads & Fresh': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'Titbits & Starters': 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=600&q=80',
  'Tandoor Se': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'Indo-Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  'Pasta & Continental': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=600&q=80',
  'Artisan Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'Indian Main Course': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  'Rice & Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'Tandoori Breads': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  'Shakes & Thick Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
  'Mocktails & Coolers': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
};

const categoryIconMap = {
  'cat-soups': '🥣',
  'cat-salads': '🥗',
  'cat-titbits': '🍟',
  'cat-tandoor': '🍢',
  'cat-chinese': '🥢',
  'cat-pasta': '🍝',
  'cat-pizza': '🍕',
  'cat-main': '🍛',
  'cat-biryani': '🍚',
  'cat-breads': '🫓',
  'cat-desserts': '🍨',
  'cat-shakes': '🥤',
  'cat-mocktails': '🍹'
};

const categories = vercelParsed.categories.map(c => ({
  id: c.id,
  name: c.name,
  subtitle: c.subtitle,
  icon: categoryIconMap[c.id] || '🍽️',
  order: c.order || 1,
  isActive: c.isActive !== false
}));

// Map category name to category ID
const catNameToId = {};
categories.forEach(c => {
  catNameToId[c.name] = c.id;
});

// Specific image overrides for known dishes
const specificImages = {
  'Tomato Basil Soup': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
  'Veg Manchow Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'Almond Broccoli Velouté': 'https://images.unsplash.com/photo-1607528971899-2e7a3be368b6?auto=format&fit=crop&w=600&q=80',
  'Burnt Garlic Thai Khow Suey Soup': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
  'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
  'Greek Salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'Peri Peri Fries': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
  'Dynamite Cheese Bombs': 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=600&q=80',
  'Crackling Spinach with Almond Silver': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  'Paneer Tikka Classic': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'Paneer Chermoula': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'Tandoori Stuffed Mushrooms': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  'Thread Paneer': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  'Veg Manchurian Dry': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  'Japanese Blue Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  'Tex Mex Nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
  'Signature Cheese Fondue': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  'Classic Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
  'Tandoori Paneer Delight Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'Five Cheese Pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  'Kaju Curry': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  'Cheese Garlic Naan': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'Paneer Tikka Dum Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'Sizzling Chocolate Brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  'Biscoff Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
  'Classic Mint Mojito': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
};

const items = vercelItems.map((item, idx) => {
  const catId = catNameToId[item.category] || 'cat-soups';
  let image = specificImages[item.name];
  if (!image) {
    image = categoryImages[item.category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
  }

  return {
    id: item.id || `dish-${idx + 1}`,
    name: item.name,
    categoryId: catId,
    categoryName: item.category,
    price: item.price,
    originalPrice: item.isBestseller ? Math.round(item.price * 1.15) : null,
    isVeg: item.type === 'veg' || true,
    isJain: Boolean(item.isJain),
    isChefSpecial: Boolean(item.isChefSpecial),
    isBestseller: Boolean(item.isBestseller),
    isSpicy: Boolean(item.isSpicy),
    spiceLevel: item.isSpicy ? 2 : (item.tags && item.tags.includes('Spicy') ? 3 : 0),
    isAvailable: item.isAvailable !== false,
    description: item.description || 'Prepared fresh with fine grade culinary ingredients.',
    image: image,
    portion: item.category.includes('Soup') || item.category.includes('Mocktail') || item.category.includes('Shake') ? '1 Serving' : (item.category.includes('Pizza') ? '6 Slices (10")' : 'Serves 1-2'),
    prepTime: item.category.includes('Mocktail') || item.category.includes('Shake') ? '5-8 mins' : '15-20 mins',
    tags: item.tags || []
  };
});

const settings = {
  restaurantName: "La Mensa",
  tagline: "Multi Cuisine Restaurant • Greater Taste, Greater Health",
  phone: "+91 98752 81816",
  whatsappNumber: "919875281816",
  address: "Near VIP Road, Vesu / Piplod, Surat, Gujarat",
  email: "lamensasurat@gmail.com",
  instagram: "lamensa_multicuisine",
  googleReviewUrl: "https://g.co/kgs/Q28SPB",
  googleMapsUrl: "https://goo.gl/maps/BPHVUQhLn2WfJgUg7",
  wifiName: "LaMensa_Guest",
  wifiPassword: "goodfoodbettervibes",
  currencySymbol: "₹",
  gstPercentage: 5,
  tableCount: 25,
  themeColor: "#dfb15b",
  openTime: "11:00 AM",
  closeTime: "11:30 PM",
  enableDirectOrders: true,
  enableWhatsAppOrders: true
};

const sampleOrders = [
  {
    id: "ORD-2041",
    tableNumber: "Table 8",
    customerName: "Ankit Jain",
    customerPhone: "+91 98752 81816",
    status: "Preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    items: [
      { id: "soup-1", name: "Tomato Basil Soup", price: 199, qty: 2 },
      { id: "pizza-1", name: "Classic Margherita Pizza", price: 490, qty: 1 },
      { id: "bev-4", name: "Classic Mint Mojito", price: 210, qty: 2 }
    ],
    subtotal: 1308,
    gst: 65.4,
    total: 1373.4,
    notes: "Please prepare in 100% Jain option (no onion / garlic / potato)"
  }
];

const completeDb = {
  settings,
  categories,
  items,
  orders: sampleOrders
};

fs.writeFileSync(path.join(__dirname, 'data', 'db.json'), JSON.stringify(completeDb, null, 2), 'utf-8');
console.log(`✨ Successfully generated complete database: ${categories.length} categories, ${items.length} dishes with full Jain options!`);
