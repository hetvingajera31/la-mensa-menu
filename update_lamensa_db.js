const fs = require('fs');
const path = require('path');

const lamensaSettings = {
  restaurantName: "La Mensa",
  tagline: "Multi Cuisine Restaurant • Greater Taste, Greater Health",
  phone: "+91 98752 81816",
  whatsappNumber: "919875281816",
  address: "VIP Road, Vesu / Piplod, Surat, Gujarat",
  email: "lamensasurat@gmail.com",
  instagram: "lamensa_multicuisine",
  currencySymbol: "₹",
  gstPercentage: 5,
  tableCount: 25,
  themeColor: "#f59e0b",
  openTime: "11:00 AM",
  closeTime: "11:30 PM",
  enableDirectOrders: true,
  enableWhatsAppOrders: true
};

const categories = [
  {
    id: "cat-soups",
    name: "Soups",
    slug: "soups",
    icon: "🥣",
    description: "Hearty, comforting international and oriental soups made without artificial additives"
  },
  {
    id: "cat-salads",
    name: "Salads & Accompaniments",
    slug: "salads",
    icon: "🥗",
    description: "Crisp fresh gourmet salads, papads and traditional beverages"
  },
  {
    id: "cat-appetizers",
    name: "Appetizers & Titbits",
    slug: "appetizers",
    icon: "🍟",
    description: "Crispy bites, cheese bombs, croquettes and finger foods"
  },
  {
    id: "cat-tandoor",
    name: "Tandoor Se",
    slug: "tandoor",
    icon: "🍢",
    description: "Authentic clay oven char-grilled tikkas, kebabs & platters"
  },
  {
    id: "cat-oriental",
    name: "Chinese & Oriental",
    slug: "oriental",
    icon: "🥡",
    description: "Indo-Chinese delights, noodles, dimsums and special fried rice"
  },
  {
    id: "cat-continental",
    name: "Continental & Mexican",
    slug: "continental",
    icon: "🌮",
    description: "Sizzling fondue, cheesy nachos, enchiladas and burrito bowls"
  },
  {
    id: "cat-italian",
    name: "Pasta & Risotto",
    slug: "italian",
    icon: "🍝",
    description: "Handcrafted pastas, rich Alfredo, Pesto, Ravioli and creamy Risottos"
  },
  {
    id: "cat-pizza",
    name: "Brick Oven Pizza",
    slug: "pizza",
    icon: "🍕",
    description: "Artisanal hand-stretched stone baked pizzas with signature gourmet sauces"
  },
  {
    id: "cat-lebanese-sizzler",
    name: "Lebanese & Sizzlers",
    slug: "sizzlers",
    icon: "🧆",
    description: "Authentic falafel platters, hummus pita and sizzling hot plates"
  },
  {
    id: "cat-indian-mains",
    name: "Indian Main Course",
    slug: "indian-mains",
    icon: "🍛",
    description: "Rich paneer gravies, kaju curries, koftas and slow-cooked dals"
  },
  {
    id: "cat-breads-biryani",
    name: "Tandoori Breads & Biryani",
    slug: "breads-biryani",
    icon: "🫓",
    description: "Fresh garlic naan, kulchas, aromatic dum biryanis and pulao"
  },
  {
    id: "cat-desserts",
    name: "Desserts & Shakes",
    slug: "desserts",
    icon: "🍨",
    description: "Sizzling brownies, artisan thick shakes, Shahi Tukda & hot gulab jamun"
  },
  {
    id: "cat-beverages",
    name: "Artisan Coffee & Mocktails",
    slug: "beverages",
    icon: "🍹",
    description: "Manual brew coffees, frappes, iced teas and refreshing coolers"
  }
];

const items = [
  // --- SOUPS ---
  {
    id: "soup-1",
    name: "Manchow Soup",
    categoryId: "cat-soups",
    price: 210,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "The all-time favourite Indo-Chinese soup with soy, fresh chilli, diced vegetables and crispy fried noodles.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "10 mins"
  },
  {
    id: "soup-2",
    name: "Tomato Basil Soup",
    categoryId: "cat-soups",
    price: 199,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Rich and fragrant slow-roasted tomato broth tempered with fresh sweet basil and served with crisp bread sticks.",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "10 mins"
  },
  {
    id: "soup-3",
    name: "Roasted Almond Broccoli Soup",
    categoryId: "cat-soups",
    price: 250,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Protein-rich creamy broccoli velouté blended with roasted toasted almond flakes for a luxurious nutty flavor.",
    image: "https://images.unsplash.com/photo-1607528971899-2e7a3be368b6?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "12 mins"
  },
  {
    id: "soup-4",
    name: "Tom Yum Soup",
    categoryId: "cat-soups",
    price: 250,
    isVeg: true,
    spiceLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic spicy and sour Thai soup infused with lemongrass, kaffir lime leaves, galangal and exotic vegetables.",
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "12 mins"
  },
  {
    id: "soup-5",
    name: "Khow Suey Soup",
    categoryId: "cat-soups",
    price: 330,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Rich and velvety Burmese coconut milk broth served with tender noodles and an array of crunchy condiments.",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "15 mins"
  },
  {
    id: "soup-6",
    name: "Broccoli & Cheddar Soup",
    categoryId: "cat-soups",
    price: 389,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Decadent aged English cheddar blended with fresh broccoli florets, served with crispy lavash and cream cheese.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1",
    prepTime: "12 mins"
  },

  // --- SALADS & ACCOMPANIMENTS ---
  {
    id: "salad-1",
    name: "Caesar Salad",
    categoryId: "cat-salads",
    price: 290,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Crisp romaine iceberg lettuce, herb garlic croutons, and shaved parmesan tossed in classic creamy Caesar dressing.",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "10 mins"
  },
  {
    id: "salad-2",
    name: "Greek Salad",
    categoryId: "cat-salads",
    price: 310,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Cucumbers, cherry tomatoes, Kalamata olives, bell peppers and fresh feta cheese dressed in extra virgin olive oil.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "8 mins"
  },
  {
    id: "salad-3",
    name: "Som Tom (Thai Papaya Salad)",
    categoryId: "cat-salads",
    price: 290,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Shredded raw green papaya, raw mango, French beans and cherry tomatoes tossed with sweet chili lime dressing & crushed peanuts.",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "10 mins"
  },
  {
    id: "salad-4",
    name: "Cheese Masala Papad",
    categoryId: "cat-salads",
    price: 129,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Crisp roasted urad papad loaded with spiced chopped onion, tomatoes, fresh coriander and a mountain of grated cheese.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    portion: "1 Pc",
    prepTime: "5 mins"
  },

  // --- APPETIZERS ---
  {
    id: "app-1",
    name: "Dynamite Cheese Bombs",
    categoryId: "cat-appetizers",
    price: 329,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Golden fried panko crumb balls oozing with melted mozzarella, cheddar, sweet corn, green chilies and jalapeños.",
    image: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs",
    prepTime: "12 mins"
  },
  {
    id: "app-2",
    name: "Peri Peri Paneer Bites",
    categoryId: "cat-appetizers",
    price: 360,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Crispy fried cottage cheese chunks dusted with fiery African peri-peri seasoning and served with garlic mayo dip.",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "12 mins"
  },
  {
    id: "app-3",
    name: "Crackling Spinach with Almond Silver",
    categoryId: "cat-appetizers",
    price: 399,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Chef's creation: Crispy shredded spinach flash-tossed with toasted sesame seeds and slivered roasted almonds.",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "10 mins"
  },
  {
    id: "app-4",
    name: "Peri Peri Fries",
    categoryId: "cat-appetizers",
    price: 170,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy skin-on potato fries tossed in tangy & spicy peri peri dust.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
    portion: "Full Basket",
    prepTime: "8 mins"
  },

  // --- TANDOOR SE ---
  {
    id: "tand-1",
    name: "Paneer Tikka Classic",
    categoryId: "cat-tandoor",
    price: 360,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Soft cottage cheese marinated in hung curd, Kashmiri deggi mirch and roasted carom seeds, skewered with bell peppers.",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs",
    prepTime: "18 mins"
  },
  {
    id: "tand-2",
    name: "Paneer Chermoula (Chef's Special)",
    categoryId: "cat-tandoor",
    price: 380,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Chef's highly recommended specialty: Cottage cheese marinated in Moroccan Chermoula herb paste and roasted in clay oven.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs",
    prepTime: "20 mins"
  },
  {
    id: "tand-3",
    name: "Tandoori Stuffed Mushrooms",
    categoryId: "cat-tandoor",
    price: 339,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Plump button mushrooms filled with spiced cheese and spinach, grilled to a golden smoky finish.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs",
    prepTime: "15 mins"
  },
  {
    id: "tand-4",
    name: "Grand Tandoori Platter",
    categoryId: "cat-tandoor",
    price: 989,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Assorted feast of Paneer Tikka, Chermoula Paneer, Stuffed Mushrooms, Tandoori Soya Chaap, Lassoni Broccoli & Dips.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 3-4",
    prepTime: "25 mins"
  },
  {
    id: "tand-5",
    name: "Lassoni Broccoli",
    categoryId: "cat-tandoor",
    price: 410,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy broccoli florets steeped in roasted garlic infused yogurt marinade and barbecued over charcoal.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "15 mins"
  },

  // --- ORIENTAL & CHINESE ---
  {
    id: "ori-1",
    name: "Thread Paneer (Must Try)",
    categoryId: "cat-oriental",
    price: 470,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Crisp marinated paneer fingers wrapped in fine wonton pastry threads and fried until golden, served with sweet chili sauce.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs",
    prepTime: "15 mins"
  },
  {
    id: "ori-2",
    name: "Veg Manchurian Dry / Gravy",
    categoryId: "cat-oriental",
    price: 290,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Finely minced vegetable dumplings simmered in savory dark soy, garlic, ginger and spring onion sauce.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "15 mins"
  },
  {
    id: "ori-3",
    name: "Japanese Blue Fried Rice",
    categoryId: "cat-oriental",
    price: 379,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Signature natural butterfly pea flower blue rice stir-fried with shiitake mushrooms, baby corn, edamame and crispy garlic.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "15 mins"
  },
  {
    id: "ori-4",
    name: "Burmese Khao Suey Rice & Noodles",
    categoryId: "cat-oriental",
    price: 599,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Signature Burmese coconut broth served over noodles and rice with fried garlic, crushed peanuts, spring onions and lime wedges.",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "20 mins"
  },
  {
    id: "ori-5",
    name: "Veg Hakka Noodles",
    categoryId: "cat-oriental",
    price: 280,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Wok-tossed noodles with shredded cabbage, carrots, capsicum and scallions in light soy seasoning.",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "12 mins"
  },

  // --- CONTINENTAL & MEXICAN ---
  {
    id: "cont-1",
    name: "Tex Mex Nachos Deluxe",
    categoryId: "cat-continental",
    price: 429,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Crisp stone ground tortilla chips piled high with refried beans, fresh tomato salsa, sour cream, jalapeños & warm liquid cheese.",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "12 mins"
  },
  {
    id: "cont-2",
    name: "Signature Cheese Fondue",
    categoryId: "cat-continental",
    price: 640,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Warm bubbling pot of Swiss cheese blend infused with herbs, served with toasted herb bread cubes, nachos and potato wedges.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "15 mins"
  },
  {
    id: "cont-3",
    name: "Baked Enchiladas",
    categoryId: "cat-continental",
    price: 439,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Corn tortillas rolled with spiced beans and vegetables, smothered in Mexican chili tomato sauce and oven-baked with cheese.",
    image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "18 mins"
  },

  // --- PASTA & ITALIAN ---
  {
    id: "past-1",
    name: "Pasta Cheese Alfredo (Penne/Spaghetti)",
    categoryId: "cat-italian",
    price: 360,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Al dente pasta tossed in rich parmesan cream sauce with garlic, butter, fresh cracked pepper and sauteed mushrooms.",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "15 mins"
  },
  {
    id: "past-2",
    name: "Pink Sauce Pasta Special",
    categoryId: "cat-italian",
    price: 360,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "The perfect harmony of tangy pomodoro tomato and creamy Alfredo sauce, tossed with broccoli, olives and bell peppers.",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "15 mins"
  },
  {
    id: "past-3",
    name: "Spinach & Corn Cheese Ravioli",
    categoryId: "cat-italian",
    price: 480,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Handcrafted pasta pillows stuffed with ricotta, creamed spinach and sweet corn, served in a velvety butter herb emulsion.",
    image: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=600&q=80",
    portion: "6 Pcs Ravioli",
    prepTime: "18 mins"
  },
  {
    id: "past-4",
    name: "Sundried Tomato Risotto",
    categoryId: "cat-italian",
    price: 480,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Italian Arborio rice slow cooked in vegetable broth and rich tomato concasse, topped with tart sundried tomatoes and whipped cheese.",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
    portion: "Full Plate",
    prepTime: "20 mins"
  },

  // --- BRICK OVEN PIZZA ---
  {
    id: "pizz-1",
    name: "Classic Margherita Pizza",
    categoryId: "cat-pizza",
    price: 490,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Stone oven crust with San Marzano marinara, 100% whole milk mozzarella, cherry tomatoes, extra virgin olive oil and fresh basil.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    portion: "6 Slices (10\")",
    prepTime: "15 mins"
  },
  {
    id: "pizz-2",
    name: "Tandoori Paneer Delight Pizza",
    categoryId: "cat-pizza",
    price: 560,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Pizza sauce, fresh mozzarella, spiced tandoori paneer tikka, bell peppers, garlic chips, black olives and oregano.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    portion: "6 Slices (10\")",
    prepTime: "18 mins"
  },
  {
    id: "pizz-3",
    name: "Spinach Basil Pesto Pizza",
    categoryId: "cat-pizza",
    price: 770,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Aromatic basil pesto base, mozzarella & cheddar, fresh spinach, garlic, parmesan, sweet corn and sliced black olives.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    portion: "6 Slices (10\")",
    prepTime: "18 mins"
  },
  {
    id: "pizz-4",
    name: "Five Cheese Gourmet Pizza",
    categoryId: "cat-pizza",
    price: 810,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "For cheese lovers: Marinara topped with a decadent blend of Mozzarella, Cheddar, Parmesan, Creamy Ricotta and Feta.",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    portion: "6 Slices (10\")",
    prepTime: "18 mins"
  },

  // --- LEBANESE & SIZZLERS ---
  {
    id: "sizz-1",
    name: "Falafel Platter Royal",
    categoryId: "cat-lebanese-sizzler",
    price: 1290,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Grand Mediterranean platter: Crisp herb falafels, silky Arabic hummus, Fattoush salad, Baba Ghanoush, Garlic Tahini, Tzatziki, Muhammara, Arabic pickles & warm pita.",
    image: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2-3",
    prepTime: "20 mins"
  },
  {
    id: "sizz-2",
    name: "Paneer Shashlik Sizzler",
    categoryId: "cat-lebanese-sizzler",
    price: 670,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Smoky grilled paneer shashlik served on a bed of buttered herb rice, French fries, steamed vegetables and spicy barbecue sauce.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "20 mins"
  },
  {
    id: "sizz-3",
    name: "Hummus with Warm Pita",
    categoryId: "cat-lebanese-sizzler",
    price: 290,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Smooth chickpea and tahini spread topped with extra virgin olive oil, paprika and roasted chickpeas, served with warm pita.",
    image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "10 mins"
  },

  // --- INDIAN MAIN COURSE ---
  {
    id: "ind-1",
    name: "Paneer Butter Masala",
    categoryId: "cat-indian-mains",
    price: 389,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Succulent paneer cubes simmered in a velvety, buttery tomato and cashew gravy delicately perfumed with kasuri methi.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "15 mins"
  },
  {
    id: "ind-2",
    name: "Kaju Curry (Royal Masala)",
    categoryId: "cat-indian-mains",
    price: 469,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Crispy roasted whole cashews simmered in a royal, rich onion-tomato and almond gravy.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "18 mins"
  },
  {
    id: "ind-3",
    name: "Dal Makhani (Overnight Simmered)",
    categoryId: "cat-indian-mains",
    price: 270,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Whole black urad lentils slow-cooked overnight with white butter, fresh cream and aromatic spices.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "15 mins"
  },
  {
    id: "ind-4",
    name: "Cheese Butter Masala",
    categoryId: "cat-indian-mains",
    price: 449,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Chunks of rich processed cheese cooked in a smooth, mild tomato makhni gravy with lots of cream and butter.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "15 mins"
  },
  {
    id: "ind-5",
    name: "Lasooni Dal Palak",
    categoryId: "cat-indian-mains",
    price: 259,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Yellow toor dal tempered with fresh spinach puree, roasted garlic cloves, cumin and whole red chilies.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 2",
    prepTime: "12 mins"
  },

  // --- BREADS & BIRYANI ---
  {
    id: "bread-1",
    name: "Cheese Garlic Naan",
    categoryId: "cat-breads-biryani",
    price: 159,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Refined flour dough stuffed with gooey melted cheese and topped with minced garlic and butter, baked in tandoor.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    portion: "1 Pc",
    prepTime: "8 mins"
  },
  {
    id: "bread-2",
    name: "Paneer Tikka Dum Biryani",
    categoryId: "cat-breads-biryani",
    price: 380,
    isVeg: true,
    spiceLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Long grain aged basmati rice slow-cooked on dum with char-grilled paneer tikka, saffron, mint and brown onions, served with Raita.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "20 mins"
  },
  {
    id: "bread-3",
    name: "La Mensa Bread Basket",
    categoryId: "cat-breads-biryani",
    price: 390,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Assortment of Butter Roti, Missi Roti, Laccha Paratha, Cheese Garlic Naan & Masala Kulcha.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    portion: "5 Assorted Breads",
    prepTime: "12 mins"
  },

  // --- DESSERTS ---
  {
    id: "des-1",
    name: "Sizzling Chocolate Brownie with Ice-Cream",
    categoryId: "cat-desserts",
    price: 330,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Warm walnut brownie served on a cast-iron sizzler with vanilla bean ice cream, showered with hot molten chocolate fudge.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    portion: "Serves 1-2",
    prepTime: "10 mins"
  },
  {
    id: "des-2",
    name: "Royal Shahi Tukda",
    categoryId: "cat-desserts",
    price: 250,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy ghee-fried bread soaked in fragrant saffron syrup and topped with rich thick rabri, silver vark and pistachios.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    portion: "2 Pcs",
    prepTime: "8 mins"
  },
  {
    id: "des-3",
    name: "Brownie Oreo Thick Shake",
    categoryId: "cat-desserts",
    price: 220,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Decadent thick shake blended with whole fudge brownie, crunchy Oreo cookies, ice cream and chocolate drizzle.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    portion: "350 ml",
    prepTime: "6 mins"
  },

  // --- ARTISAN COFFEES & MOCKTAILS ---
  {
    id: "bev-1",
    name: "Biscoff Cappuccino",
    categoryId: "cat-beverages",
    price: 199,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Rich espresso and steamed frothed milk infused with caramelized Lotus Biscoff spread and cookie crumbs.",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    portion: "220 ml",
    prepTime: "5 mins"
  },
  {
    id: "bev-2",
    name: "Love Potion Mocktail",
    categoryId: "cat-beverages",
    price: 230,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "A magical signature mocktail with fresh strawberries, passionfruit, crushed mint and sparkling citrus soda.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    portion: "350 ml",
    prepTime: "5 mins"
  },
  {
    id: "bev-3",
    name: "Mango Mule Cooler",
    categoryId: "cat-beverages",
    price: 260,
    isVeg: true,
    spiceLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Refreshing cooler made with Alphonso mango nectar, wild honey, muddled cucumber, fresh ginger and lime.",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
    portion: "350 ml",
    prepTime: "5 mins"
  },
  {
    id: "bev-4",
    name: "Classic Mint Mojito",
    categoryId: "cat-beverages",
    price: 210,
    isVeg: true,
    spiceLevel: 0,
    isBestseller: true,
    isAvailable: true,
    description: "Muddled fresh mint leaves, lime chunks, brown sugar and chilled sparkling soda over crushed ice.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    portion: "350 ml",
    prepTime: "5 mins"
  }
];

const sampleOrders = [
  {
    id: "ORD-101",
    tableNumber: "Table 5",
    customerName: "Jayesh Patel",
    customerPhone: "+91 98752 81816",
    status: "Preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    items: [
      { id: "tand-1", name: "Paneer Tikka Classic", price: 360, qty: 1 },
      { id: "past-2", name: "Pink Sauce Pasta Special", price: 360, qty: 1 },
      { id: "bev-4", name: "Classic Mint Mojito", price: 210, qty: 2 }
    ],
    subtotal: 1140,
    gst: 57,
    total: 1197,
    notes: "Make the pasta extra cheesy please!"
  }
];

const dbData = {
  settings: lamensaSettings,
  categories: categories,
  items: items,
  orders: sampleOrders
};

fs.writeFileSync(path.join(__dirname, 'data', 'db.json'), JSON.stringify(dbData, null, 2), 'utf-8');
console.log(`✅ Successfully loaded La Mensa database with ${categories.length} categories and ${items.length} curated multi-cuisine dishes!`);
