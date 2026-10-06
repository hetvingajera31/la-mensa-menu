const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read DB
function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { settings: {}, categories: [], items: [], orders: [] };
  }
}

// Helper to write DB safely
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// 1. Get full database state
app.get('/api/data', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db });
});

// 2. Get customer menu (public)
app.get('/api/menu', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    settings: db.settings,
    categories: db.categories,
    items: db.items
  });
});

// 3. Stats for Admin Dashboard
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const totalItems = db.items.length;
  const inStockCount = db.items.filter(i => i.isAvailable !== false).length;
  const outOfStockCount = totalItems - inStockCount;
  const vegCount = db.items.filter(i => i.isVeg).length;
  const nonVegCount = totalItems - vegCount;
  const totalCategories = db.categories.length;
  const activeOrders = (db.orders || []).filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const totalRevenue = (db.orders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  res.json({
    success: true,
    stats: {
      totalItems,
      inStockCount,
      outOfStockCount,
      vegCount,
      nonVegCount,
      totalCategories,
      activeOrders,
      totalOrders: (db.orders || []).length,
      totalRevenue: Math.round(totalRevenue)
    }
  });
});

// --- ITEMS CRUD ---
// Add Item
app.post('/api/items', (req, res) => {
  const db = readDb();
  const {
    name, categoryId, price, originalPrice, isVeg, isJain, isChefSpecial,
    spiceLevel, isBestseller, isAvailable, description, image, portion, prepTime, tags
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Item name and price are required.' });
  }

  const newItem = {
    id: 'item-' + Date.now(),
    name: name.trim(),
    categoryId: categoryId || (db.categories[0] ? db.categories[0].id : 'general'),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
    isJain: Boolean(isJain),
    isChefSpecial: Boolean(isChefSpecial),
    spiceLevel: Number(spiceLevel || 0),
    isBestseller: Boolean(isBestseller),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    description: description ? description.trim() : '',
    image: image && image.trim() !== '' ? image.trim() : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    portion: portion ? portion.trim() : '1 Portion',
    prepTime: prepTime ? prepTime.trim() : '15 mins',
    tags: Array.isArray(tags) ? tags : []
  };

  db.items.push(newItem);
  writeDb(db);
  res.json({ success: true, message: 'Item added successfully', item: newItem });
});

// Update Item
app.put('/api/items/:id', (req, res) => {
  const db = readDb();
  const itemId = req.params.id;
  const index = db.items.findIndex(i => i.id === itemId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const existing = db.items[index];
  const {
    name, categoryId, price, originalPrice, isVeg, isJain, isChefSpecial,
    spiceLevel, isBestseller, isAvailable, description, image, portion, prepTime, tags
  } = req.body;

  db.items[index] = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
    price: price !== undefined ? Number(price) : existing.price,
    originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : existing.originalPrice,
    isVeg: isVeg !== undefined ? Boolean(isVeg) : existing.isVeg,
    isJain: isJain !== undefined ? Boolean(isJain) : Boolean(existing.isJain),
    isChefSpecial: isChefSpecial !== undefined ? Boolean(isChefSpecial) : Boolean(existing.isChefSpecial),
    spiceLevel: spiceLevel !== undefined ? Number(spiceLevel) : existing.spiceLevel,
    isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : existing.isBestseller,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
    description: description !== undefined ? description.trim() : existing.description,
    image: image !== undefined && image.trim() !== '' ? image.trim() : existing.image,
    portion: portion !== undefined ? portion.trim() : existing.portion,
    prepTime: prepTime !== undefined ? prepTime.trim() : existing.prepTime,
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : existing.tags) : (existing.tags || [])
  };

  writeDb(db);
  res.json({ success: true, message: 'Item updated successfully', item: db.items[index] });
});

// Quick Toggle Stock Status
app.patch('/api/items/:id/toggle-stock', (req, res) => {
  const db = readDb();
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  item.isAvailable = item.isAvailable === false ? true : false;
  writeDb(db);
  res.json({ success: true, message: `Stock status set to ${item.isAvailable ? 'Available' : 'Out of stock'}`, isAvailable: item.isAvailable });
});

// Delete Item
app.delete('/api/items/:id', (req, res) => {
  const db = readDb();
  const initialLength = db.items.length;
  db.items = db.items.filter(i => i.id !== req.params.id);

  if (db.items.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Item deleted successfully' });
});

// --- CATEGORIES CRUD ---
// Add Category
app.post('/api/categories', (req, res) => {
  const db = readDb();
  const { name, icon, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = {
    id: 'cat-' + Date.now(),
    name: name.trim(),
    slug: slug || 'cat-' + Date.now(),
    icon: icon ? icon.trim() : '🍽️',
    description: description ? description.trim() : ''
  };

  db.categories.push(newCat);
  writeDb(db);
  res.json({ success: true, message: 'Category created successfully', category: newCat });
});

// Update Category
app.put('/api/categories/:id', (req, res) => {
  const db = readDb();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

  const { name, icon, description } = req.body;
  if (name) db.categories[index].name = name.trim();
  if (icon !== undefined) db.categories[index].icon = icon.trim();
  if (description !== undefined) db.categories[index].description = description.trim();

  writeDb(db);
  res.json({ success: true, message: 'Category updated', category: db.categories[index] });
});

// Delete Category
app.delete('/api/categories/:id', (req, res) => {
  const db = readDb();
  const catId = req.params.id;
  
  // Check if items belong to this category
  const hasItems = db.items.some(i => i.categoryId === catId);
  if (hasItems) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category that contains menu items. Move or delete the items first.'
    });
  }

  db.categories = db.categories.filter(c => c.id !== catId);
  writeDb(db);
  res.json({ success: true, message: 'Category deleted' });
});

// --- SETTINGS ---
app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  writeDb(db);
  res.json({ success: true, message: 'Settings saved successfully', settings: db.settings });
});

// --- ORDERS ---
// Place Order
app.post('/api/orders', (req, res) => {
  const db = readDb();
  const { tableNumber, customerName, customerPhone, items, subtotal, gst, total, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  }

  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    tableNumber: tableNumber || 'Takeaway',
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    items: items,
    subtotal: Number(subtotal) || 0,
    gst: Number(gst) || 0,
    total: Number(total) || 0,
    notes: notes || ''
  };

  if (!db.orders) db.orders = [];
  db.orders.unshift(newOrder); // latest on top
  writeDb(db);

  res.json({ success: true, message: 'Order placed successfully!', order: newOrder });
});

// Update Order Status
app.patch('/api/orders/:id/status', (req, res) => {
  const db = readDb();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  order.status = status;
  writeDb(db);
  res.json({ success: true, message: `Order marked as ${status}`, order });
});

// Delete Order
app.delete('/api/orders/:id', (req, res) => {
  const db = readDb();
  db.orders = (db.orders || []).filter(o => o.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Order removed' });
});

// Serve frontend routes
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback to index.html for customer hub
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ Restaurant Menu Server is running on http://localhost:${PORT}`);
  console.log(`📱 Customer Menu:  http://localhost:${PORT}/`);
  console.log(`⚙️  Admin Panel:    http://localhost:${PORT}/admin`);
});
