# 🍽️ The Royal Spice - Digital Restaurant Menu & Admin Panel

Ek modern, fast aur responsive **Digital QR Restaurant Menu aur Full Admin Panel System** jo restaurant ke pure menu, categories, pricing, veg/non-veg status, table QR codes aur kitchen orders ko manage karne ke liye taiyaar kiya gaya hai.

---

## 🌟 Features

### 📱 1. Customer Digital Menu (`/`)
- **Modern Luxury UI**: Dark & Light mode support, high quality food imagery, smooth category navigation.
- **Search & Dietary Filters**: Instant dish search, Pure Veg 🟢, Non-Veg 🔴, Chef's Special ⭐, Spicy Level 🌶️ filters.
- **Portion & Spice Details**: Portion sizes, preparation time, ingredient description.
- **Smart Cart & Floating Order Drawer**: Bill calculation with automated GST (5%) & subtotal breakdown.
- **Table Dine-In & QR Code Integration**: Table number selection (Table 1 to 20 or Takeaway).
- **Two Checkout Modes**:
  1. 📲 **WhatsApp Ordering**: 1-click formatted bill receipt direct to restaurant WhatsApp.
  2. 🔔 **Send to Kitchen (KDS)**: Direct order submission to the admin kitchen display screen in real-time.

### ⚙️ 2. Comprehensive Admin Panel (`/admin`)
- **Dashboard & Analytics**: Total menu items, active categories, live orders, Veg/Non-Veg ratio, in-stock count.
- **Menu Items Manager**:
  - Add / Edit dishes (Name, Category, Price, Discount Price, Veg/Non-Veg, Spice level, Photo URL, Portion, Description, Bestseller badge).
  - 1-Click **Quick Stock Toggle** (`In Stock` 🟢 / `Out of Stock` 🔴).
  - Delete items with confirmation.
- **Category Manager**: Add, edit, or delete custom categories with emojis/icons.
- **Live Kitchen Display System (KDS)**: Real-time table orders feed with status pipeline (`Pending` ⏳ ➔ `Preparing` 🍳 ➔ `Served` 🍽️ ➔ `Completed` ✅).
- **Printable Table QR Generator**: Select any table number or whole menu and instantly preview/download high-resolution printable QR codes.
- **Restaurant Settings**: Update restaurant name, tagline, WhatsApp order number, timings, currency symbol (₹), and tax percentage.

---

## 🚀 How to Run

1. Open terminal in the project directory:
   ```bash
   cd d:\menus
   ```

2. Start the Express server:
   ```bash
   npm start
   # or
   node server.js
   ```

3. Access the URLs in your browser:
   - 📱 **Customer Digital Menu**: [http://localhost:3000/](http://localhost:3000/)
   - ⚙️ **Admin Management Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 File Structure

```
d:\menus\
│
├── data\
│   └── db.json               # Persistent JSON database (Settings, Categories, Dishes, Orders)
├── public\
│   ├── index.html            # Customer menu interface
│   ├── app.js                # Customer menu logic (Cart, filters, WhatsApp & Kitchen order)
│   ├── style.css             # Customer menu custom styles
│   ├── admin.html            # Admin dashboard interface
│   ├── admin.js              # Admin CRUD, live orders & QR generator logic
│   └── admin.css             # Admin dashboard custom styles
├── server.js                 # Express.js REST API server
├── package.json              # Project dependencies & scripts
└── README.md                 # Documentation
```
