const fs = require('fs');
const path = require('path');

// Category Image Presets
const categoryImageMap = {
  'cat-soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'cat-salads': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'cat-titbits': 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&w=600&q=80',
  'cat-tandoor': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'cat-chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  'cat-pasta': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=600&q=80',
  'cat-pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'cat-main': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  'cat-dal-rice': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'cat-breads': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'cat-mocktails': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  'cat-beverages': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  'cat-desserts': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
};

// All items from the 35-page PDF menu
const pdfItems = [
  // --- Page 5: SOUPS ---
  {
    name: 'Manchow Soup',
    categoryId: 'cat-soups',
    price: 210,
    description: 'The all-time favourite Indo-Chinese soup with soy, chilli, finely diced vegetables and crispy fried noodles.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Hot Garlic Soup',
    categoryId: 'cat-soups',
    price: 220,
    description: 'Assorted fresh garden vegetables stewed in a hot, tangy and aromatic garlic consommé broth.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Minestrone Soup',
    categoryId: 'cat-soups',
    price: 220,
    description: 'Fresh Italian vegetables, beans and pasta simmered in a hearty herb-infused tomato broth.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Lemon Coriander Soup',
    categoryId: 'cat-soups',
    price: 220,
    description: 'A light, refreshing clear vegetable soup delicately flavoured with fresh lemon juice and tender coriander leaves.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Wild Mushroom Soup',
    categoryId: 'cat-soups',
    price: 230,
    description: 'Earthy wild mushrooms slow-cooked and pureed into a velvety rich, creamy base with continental herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Chilly Bean Soup',
    categoryId: 'cat-soups',
    price: 230,
    description: 'Hearty red beans and vegetables simmered with Mexican chilli spices in a comforting creamy broth.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Roasted Almond Broccoli Soup',
    categoryId: 'cat-soups',
    price: 250,
    description: 'Protein-rich creamy broccoli soup roasted with toasted almond slivers for a luxurious nutty flavour.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Tom Yum Soup',
    categoryId: 'cat-soups',
    price: 250,
    description: 'Spicy and sour Thai soup infused with fragrant herbs, lemongrass, kaffir lime leaves and fresh galangal.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Khow Suey Soup',
    categoryId: 'cat-soups',
    price: 330,
    description: 'Rich and creamy yet tangy and salty Burmese coconut milk soup served with crunchy condiments.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Broccoli & Cheddar Soup',
    categoryId: 'cat-soups',
    price: 389,
    description: 'Aged English cheddar and tender broccoli soup served with crisp lavash and topped with rich cream cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Dumpling Soup',
    categoryId: 'cat-soups',
    price: 230,
    description: 'Delicate steamed vegetable dumplings in a mildly spiced carrot and tangy orange vegetable stock broth.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Hot Pot Soup',
    categoryId: 'cat-soups',
    price: 250,
    description: 'Chef special oriental aromatic broth with assorted exotic greens served piping hot in a traditional pot.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Filipino Soup',
    categoryId: 'cat-soups',
    price: 260,
    description: 'Chef special South East Asian tangy vegetable soup served in a hot pot with aromatic seasonings.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Tomato Basil Soup',
    categoryId: 'cat-soups',
    price: 199,
    description: 'Rich and fragrant slow-cooked ripe tomato soup finished with fresh aromatic basil leaves, served with herb bread sticks.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Tom Kha Soup',
    categoryId: 'cat-soups',
    price: 220,
    description: 'Chef special Thai coconut milk soup infused with galangal, kaffir lime, mushrooms and fresh coriander.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Sweetcorn Soup',
    categoryId: 'cat-soups',
    price: 199,
    description: 'Chef special classic creamy soup made with tender sweet golden corn kernels and finely minced vegetables.',
    isJain: true,
    isChefSpecial: true
  },

  // --- Page 7: SALAD & ACCOMPANIMENTS ---
  {
    name: 'Caesar Salad',
    categoryId: 'cat-salads',
    price: 290,
    description: 'Fresh crisp romaine and iceberg lettuce, garlic croutons and shaved parmesan tossed in authentic Caesar dressing.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Fattoush Salad',
    categoryId: 'cat-salads',
    price: 280,
    description: 'Crunchy bell peppers, onions, English cucumbers, cherry tomatoes and parmesan croutons in a tangy lemon dressing.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Green Salad',
    categoryId: 'cat-salads',
    price: 130,
    description: 'Freshly sliced garden cucumbers, tomatoes, carrots, onions, green chillies and lemon wedges.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Antipasti Salad',
    categoryId: 'cat-salads',
    price: 280,
    description: 'Sautéed exotic vegetables and sun-dried tomatoes finished with aged Italian balsamic glaze.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Greek Salad',
    categoryId: 'cat-salads',
    price: 310,
    description: 'Crisp cucumber, red onions, tomatoes, lettuce, kalamata olives and oregano in balsamic vinaigrette topped with Greek feta cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Som Tom Salad',
    categoryId: 'cat-salads',
    price: 290,
    description: 'Authentic Thai raw papaya salad with raw mango, carrot, French beans, cherry tomatoes and roasted crushed peanuts.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Roasted Papad',
    categoryId: 'cat-salads',
    price: 50,
    description: 'Crispy tandoor-roasted seasoned lentil papad.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Fried Papad',
    categoryId: 'cat-salads',
    price: 60,
    description: 'Golden deep-fried crunchy lentil papad.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Masala Papad',
    categoryId: 'cat-salads',
    price: 85,
    description: 'Crispy roasted papad generously topped with tangy diced onions, tomatoes, coriander and chaat masala.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Masala Papad',
    categoryId: 'cat-salads',
    price: 129,
    description: 'Crispy papad topped with spicy onion-tomato salsa and a lavish layer of grated processed cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Butter Milk',
    categoryId: 'cat-salads',
    price: 85,
    description: 'Refreshing homestyle churned buttermilk spiced with roasted cumin, rock salt and fresh mint.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Lassi',
    categoryId: 'cat-salads',
    price: 110,
    description: 'Rich, thick churned yogurt beverage available in Sweet, Salty, Mango, Strawberry or Pineapple flavour.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 8: APPETIZER / TITBITS ---
  {
    name: 'Hara Bhara Kebab',
    categoryId: 'cat-titbits',
    price: 330,
    description: 'Lots of green minced vegetables, spinach and green peas blended with cottage cheese, formed into succulent shallow-fried patties.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Croquettes',
    categoryId: 'cat-titbits',
    price: 299,
    description: 'Minced vegetables and mashed potatoes formed into rolls, crumbed with golden breadcrumbs and crisp fried.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Dynamite Cheese Bombs',
    categoryId: 'cat-titbits',
    price: 329,
    description: 'A molten blend of cheese, corn, chilli and jalapeños, breaded and fried to golden crisp perfection.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tomato Barbeque Cottage Cheese',
    categoryId: 'cat-titbits',
    price: 329,
    description: 'Crisp fried chunks of paneer tossed in a smoky and sweet tangy tomato BBQ sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Peri Peri Paneer',
    categoryId: 'cat-titbits',
    price: 360,
    description: 'Tender paneer cubes wok-tossed in zesty African bird\'s eye chilli and peri peri herb seasoning.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Potato Corn Jacket',
    categoryId: 'cat-titbits',
    price: 369,
    description: 'Crispy baked potato skins stuffed with creamy sweet corn, melted cheddar and fresh herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Crackling Spinach with Almond Silver',
    categoryId: 'cat-titbits',
    price: 399,
    description: 'Ultra-crisp shredded crackling spinach tossed with toasted sesame seeds and roasted crunchy almond slivers.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Saute Mushroom',
    categoryId: 'cat-titbits',
    price: 390,
    description: 'Fresh plump button mushrooms sautéed in garlic butter, cracked pepper and aromatic continental herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tikhi Matar Ki Potli',
    categoryId: 'cat-titbits',
    price: 330,
    description: 'Crispy handcrafted pastry parcels stuffed with fiery spiced green peas masala.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'French Fries',
    categoryId: 'cat-titbits',
    price: 160,
    description: 'Classic golden crisp salted potato fries served with tomato ketchup.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Peri Peri Fries',
    categoryId: 'cat-titbits',
    price: 170,
    description: 'Crispy hot french fries dusted with our signature fiery African peri peri spice blend.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Potato Wedges',
    categoryId: 'cat-titbits',
    price: 210,
    description: 'Crispy herb-crusted potato wedges served with seasoned garlic mayonnaise and sweet chilli dip.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 9: TANDOOR SE ---
  {
    name: 'Tandoori Stuffed Mushrooms',
    categoryId: 'cat-tandoor',
    price: 339,
    description: 'Juicy button mushrooms stuffed with spiced cottage cheese and herbs, marinated in red tandoori spices and char-grilled.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Tikka',
    categoryId: 'cat-tandoor',
    price: 360,
    description: 'Succulent cubes of fresh cottage cheese, capsicum and onions marinated in spiced mustard oil yogurt and grilled in clay tandoor.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Multani',
    categoryId: 'cat-tandoor',
    price: 365,
    description: 'Soft paneer chunks marinated in a spicy yellow yogurt and saffron herb paste, char-grilled to golden perfection.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Chermoula',
    categoryId: 'cat-tandoor',
    price: 380,
    description: 'Our Chef\'s highly recommended dish — fresh cottage cheese marinated in a zesty North African herb and garlic chermoula glaze.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Tandoori Soya Chaap',
    categoryId: 'cat-tandoor',
    price: 399,
    description: 'Tender soya chaap cut into succulent pieces, mixed with house special spiced marinade and roasted in the clay tandoor.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Lassoni Broccoli',
    categoryId: 'cat-tandoor',
    price: 410,
    description: 'Crisp broccoli florets marinated in wholesome roasted garlic spiced yogurt and charred over glowing embers.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tandoori Platter',
    categoryId: 'cat-tandoor',
    price: 989,
    description: 'Grand assortment of our finest tandoori appetizers including Paneer Tikka, Soya Chaap, Stuffed Mushrooms and Seekh Kebab.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Chef Special Mushroom',
    categoryId: 'cat-tandoor',
    price: 380,
    description: 'Chef\'s signature marinated button mushrooms infused with secret exotic spices and char-grilled in tandoor.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'BBQ Paneer',
    categoryId: 'cat-tandoor',
    price: 399,
    description: 'Tender cottage cheese cubes glazed with smoky American barbecue marinade and charred in the tandoor.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Aloo Ki Najakat',
    categoryId: 'cat-tandoor',
    price: 330,
    description: 'Carefully scooped and stuffed whole potatoes marinated in aromatic spices and slow-roasted in the clay oven.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Velvet Seekh Kebab',
    categoryId: 'cat-tandoor',
    price: 350,
    description: 'Finely minced vegetables, herbs and soft paneer threaded onto metal skewers and roasted to melt-in-mouth tenderness.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 10: CHINESE ---
  {
    name: 'Veg. Manchurian',
    categoryId: 'cat-chinese',
    price: 290,
    description: 'Everyone\'s all-time favourite Indo-Chinese fried vegetable balls tossed in savory soy, ginger and garlic sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Crispy (Green/Red)',
    categoryId: 'cat-chinese',
    price: 310,
    description: 'Crisp batter-fried baton vegetables stir-fried in aromatic soy and chilli sauce with sesame.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Chilli Baby Corn',
    categoryId: 'cat-chinese',
    price: 335,
    description: 'Crisp fried tender baby corn fingers tossed in hot garlic and red chilli sauce with spring onions.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Jungli Paneer',
    categoryId: 'cat-chinese',
    price: 360,
    description: 'Stir-fried paneer, colorful bell peppers and onions in a tangy and spicy parsley-coriander green chilli sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Red Cook / Paneer Chilli',
    categoryId: 'cat-chinese',
    price: 360,
    description: 'Golden fried paneer cubes cooked with crunchy bell peppers in a fiery chilli garlic flavored sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'American Corn Salt & Pepper',
    categoryId: 'cat-chinese',
    price: 310,
    description: 'Crispy fried sweet corn tossed with tri-color bell peppers, scallions and freshly cracked black pepper.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Butter Garlic Vegetable',
    categoryId: 'cat-chinese',
    price: 470,
    description: 'Our chef\'s highly recommended dish — exotic Asian greens and broccoli wok-tossed in a fragrant butter garlic glaze.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Saiwoo Paneer',
    categoryId: 'cat-chinese',
    price: 390,
    description: 'Crispy deep-fried cottage cheese cubes wok-glazed in a signature Chinese tangy red sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Thread Paneer',
    categoryId: 'cat-chinese',
    price: 470,
    description: 'Our chef\'s highly recommended must-try delicacy — paneer batons wrapped in crispy thread noodles, fried golden.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Spinach Cottage Cheese Ball in Sweet & Spicy Sauce',
    categoryId: 'cat-chinese',
    price: 399,
    description: 'Our chef\'s highly recommended dish — cottage cheese and spinach dumplings simmered in a velvety sweet and spicy glaze.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Shanghai Spring Roll',
    categoryId: 'cat-chinese',
    price: 280,
    description: 'Crispy golden fried wrappers stuffed with finely shredded seasonal vegetables and glass noodles.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 11: ORIENTAL APPETIZER & MAINS ---
  {
    name: 'Smoke Chilly Cottage Cheese Mushroom & Water Chestnut',
    categoryId: 'cat-chinese',
    price: 410,
    description: 'Smoky cottage cheese, button mushrooms and crunchy water chestnuts served sizzling on a smoking hot plate.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Crispy Lotus Stem with Curry Leaves & Black Pepper',
    categoryId: 'cat-chinese',
    price: 380,
    description: 'Crunchy sliced lotus stem chips wok-tossed with fresh curry leaves, crushed black pepper and oriental spices.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Hot Garlic Sauce',
    categoryId: 'cat-chinese',
    price: 269,
    description: 'Assorted seasonal vegetables simmered in a bold, pungent and spicy Chinese hot garlic gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Hot Garlic Sauce',
    categoryId: 'cat-chinese',
    price: 340,
    description: 'Fresh paneer cubes cooked in a bold, pungent and spicy Chinese hot garlic gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Black Bean Sauce',
    categoryId: 'cat-chinese',
    price: 269,
    description: 'Wok-tossed garden vegetables simmered in an authentic savory fermented black bean and ginger sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Black Bean Sauce',
    categoryId: 'cat-chinese',
    price: 340,
    description: 'Tender paneer cubes simmered in an authentic savory fermented black bean and ginger sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Burmese Khao-Suey Rice/Noodles',
    categoryId: 'cat-chinese',
    price: 599,
    description: 'Aromatic Burmese coconut milk curry served with your choice of steamed rice or noodles and an array of crunchy toppings.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Veg. Fried Rice',
    categoryId: 'cat-chinese',
    price: 285,
    description: 'Classic wok-tossed long-grain basmati rice with finely diced vegetables and a touch of light soy sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Burnt Garlic Fried Rice',
    categoryId: 'cat-chinese',
    price: 299,
    description: 'Fragrant wok-tossed rice infused with golden toasted burnt garlic, scallions and seasonal vegetables.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Nasi Goreng',
    categoryId: 'cat-chinese',
    price: 599,
    description: 'Traditional Indonesian spiced rice meal served with skewered vegetable stick, peanut sauce and Chinese pickle.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Mee Goreng',
    categoryId: 'cat-chinese',
    price: 599,
    description: 'Indonesian wok-tossed yellow noodles with Asian vegetables, sweet soy sauce and Chinese pickle.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Malaysian Pot Rice',
    categoryId: 'cat-chinese',
    price: 379,
    description: 'Fragrant rice layered with exotic Malaysian spiced vegetables and simmered in a clay pot.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 12: NOODLES & ASIAN ---
  {
    name: 'Veg. Hakka Noodles',
    categoryId: 'cat-chinese',
    price: 280,
    description: 'All-time classic wok-tossed noodles with shredded cabbage, carrots, bell peppers and mild Chinese seasoning.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Schezwan Noodles',
    categoryId: 'cat-chinese',
    price: 310,
    description: 'Fiery wok-tossed noodles prepared with spicy home-made Schezwan chilli pepper sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Singapore Noodles',
    categoryId: 'cat-chinese',
    price: 345,
    description: 'Thin vermicelli noodles stir-fried with colorful bell peppers, mild curry spices and sesame.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'American Chop Suey',
    categoryId: 'cat-chinese',
    price: 320,
    description: 'Crispy fried noodle nest topped with a sweet and tangy vegetable gravy and pineapple.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Pad Thai Noodles',
    categoryId: 'cat-chinese',
    price: 330,
    description: 'Traditional flat rice noodles stir-fried with tamarind sauce, bean sprouts, tofu and crushed roasted peanuts.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Chilly Garlic Noodles',
    categoryId: 'cat-chinese',
    price: 330,
    description: 'Spicy wok-tossed noodles infused with charred garlic and fiery red chilli oil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Japanese Wheat Noodles',
    categoryId: 'cat-chinese',
    price: 359,
    description: 'Wok-tossed yaki wheat noodles with broccoli, carrot, zucchini and chef\'s special Japanese seasoning.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Japanese Blue Fried Rice',
    categoryId: 'cat-chinese',
    price: 379,
    description: 'Signature natural butterfly pea flower blue Japanese rice tossed with carrot, babycorn, shiitake mushroom and fried garlic.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Veg Black Pepper Sauce',
    categoryId: 'cat-chinese',
    price: 269,
    description: 'Wok-tossed vegetables simmered in a pungent cracked black pepper and vegetarian savoury sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Thai Curry (Red/Green)',
    categoryId: 'cat-chinese',
    price: 469,
    description: 'Authentic Thai coconut milk curry infused with lemongrass, galangal and Thai basil, served with steamed jasmine rice.',
    isJain: false,
    isChefSpecial: true
  },

  // --- Page 13: FONDUE & CONTINENTAL MEXICAN ---
  {
    name: 'Black Pav Bhaji Fondue',
    categoryId: 'cat-pasta',
    price: 539,
    description: 'Innovative black-spiced pav bhaji fondue served with toasted bread cubes, soft bread and assorted dips.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Cheese Fondue',
    categoryId: 'cat-pasta',
    price: 640,
    description: 'Velvety Swiss cheese fondue served bubbling hot with fresh bread croutons, nachos and crispy potato wedges.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Desi Treat Fondue',
    categoryId: 'cat-pasta',
    price: 670,
    description: 'Spiced fusion cheese fondue served with paneer cubes, french fries and butter-tossed vegetables.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tex Mex Nachos',
    categoryId: 'cat-pasta',
    price: 429,
    description: 'Crispy tortilla chips loaded with fresh lettuce, salsa, refried beans, sour cream and melted liquid cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Enchiladas',
    categoryId: 'cat-pasta',
    price: 439,
    description: 'Soft corn tortillas stuffed with beans and vegetables, dipped in chilli tomato sauce and baked with cheese in a casserole.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Mexican Rice with Salsa',
    categoryId: 'cat-pasta',
    price: 450,
    description: 'Fragrant rice cooked with bell peppers, tomatoes, Mexican chillies and sweet corn, served with tangy salsa.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Burrito Bowl',
    categoryId: 'cat-pasta',
    price: 470,
    description: 'Cilantro-lime and paprika rice topped with seasoned kidney beans, crisp salad veggies, cheese and cool sour cream.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Nachos Platter',
    categoryId: 'cat-pasta',
    price: 599,
    description: 'Grande platter of crispy corn nachos layered with hot cheese sauce, guacamole, refried beans, jalapeños and salsa.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 14: ITALIAN MAIN COURSE & PASTA ---
  {
    name: 'Spinach Cottage Cheese Steak with Garlic Pepper Sauce',
    categoryId: 'cat-pasta',
    price: 610,
    description: 'Pan-seared spinach cottage cheese steak served with butter-tossed vegetables, mashed potatoes, herbed rice and garlic pepper sauce.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Grilled Cottage Cheese with Peri Peri Sauce',
    categoryId: 'cat-pasta',
    price: 610,
    description: 'Char-grilled cottage cheese slab served with tossed vegetables, mashed potatoes, herbed rice and spicy peri peri sauce.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Pomodoro Pasta',
    categoryId: 'cat-pasta',
    price: 360,
    description: 'Classic Italian pasta in rich tomato concassé cooked with garlic, onions, extra virgin olive oil and tempered with sweet basil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Alfredo Pasta',
    categoryId: 'cat-pasta',
    price: 360,
    description: 'Decadent cheesy white sauce pasta made with parmesan, fresh cream, roasted garlic and Italian herbs.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Pink Sauce Pasta',
    categoryId: 'cat-pasta',
    price: 360,
    description: 'Creamy combination of tomato concassé and Alfredo sauce offering a sweet, tangy and velvety cheesy flavour.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Masala Mafia Pasta',
    categoryId: 'cat-pasta',
    price: 360,
    description: 'Indian fusion spiced white sauce pasta infused with fresh green coriander, chillies and exotic herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Pesto Pasta',
    categoryId: 'cat-pasta',
    price: 420,
    description: 'Classic nutty basil pesto pasta made with fresh Genovese basil, pine nuts, garlic, parmesan and extra virgin olive oil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Spinach & Corn Cheese Ravioli',
    categoryId: 'cat-pasta',
    price: 480,
    description: 'Handmade pasta pockets filled with ricotta, spinach and sweet corn, served in a delicate creamy white sauce.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Spaghetti Aglio Olio',
    categoryId: 'cat-pasta',
    price: 460,
    description: 'Traditional Neapolitan pasta tossed in hot extra virgin olive oil with generous sliced garlic, dried red chilli flakes and parsley.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 15: BAKED DISHES & RISOTTO ---
  {
    name: 'Veg. Lasagne',
    categoryId: 'cat-pasta',
    price: 490,
    description: 'Exotic baked layered pasta sheets with seasoned vegetables, ricotta, mozzarella cheese and rich tomato basil sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Au Gratin',
    categoryId: 'cat-pasta',
    price: 490,
    description: 'Exotic garden vegetables layered in a creamy herbed béchamel sauce and baked with a golden cheese crust.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Veg. Exotica',
    categoryId: 'cat-pasta',
    price: 490,
    description: 'Exotic vegetables layered with cheesy tomato concassé and baked to bubbling perfection in a casserole.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Pineapple Mac and Cheese',
    categoryId: 'cat-pasta',
    price: 490,
    description: 'Classic comforting macaroni and cheese baked with a delightful tropical twist of sweet and tangy pineapple.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Marinara Risotto',
    categoryId: 'cat-pasta',
    price: 430,
    description: 'Slow-cooked Italian Arborio rice cooked in herb-infused marinara sauce and finished with whipped cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Sundried Tomato Risotto',
    categoryId: 'cat-pasta',
    price: 480,
    description: 'Creamy Arborio rice simmered with intense sun-dried tomatoes, parmesan and rich tomato concassé.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Formaggio Risotto',
    categoryId: 'cat-pasta',
    price: 510,
    description: 'Luxurious creamy Arborio rice cooked with a delicate blend of four cheeses, white broth and subtle herbs.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 17: LEBANESE & SIZZLER ---
  {
    name: 'Hummus with Pita',
    categoryId: 'cat-pasta',
    price: 290,
    description: 'Authentic creamy Arabic chickpea hummus blended with tahini, olive oil and paprika, served with warm pita bread.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Falafel Pita Pocket',
    categoryId: 'cat-pasta',
    price: 390,
    description: 'Crispy spiced falafel bullets, Arabic hummus and assorted dips stuffed inside fresh pita bread pockets.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Falafel Platter',
    categoryId: 'cat-pasta',
    price: 1290,
    description: 'Grande Mezze platter with falafel, hummus, fattoush salad, baba ghanoush, garlic tahini, tzatziki, muhammara, pickles and olives.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Hot Pot Sizzler',
    categoryId: 'cat-pasta',
    price: 650,
    description: 'Sizzling platter with oriental vegetables, stir-fried rice, french fries and rich savory sauce on a smoking plate.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Cutlet in Mexican Sauce Sizzler',
    categoryId: 'cat-pasta',
    price: 660,
    description: 'Golden vegetable cutlets served over Mexican paprika rice, spicy salsa sauce, potato wedges and grilled tomatoes.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Shashlik Sizzler',
    categoryId: 'cat-pasta',
    price: 670,
    description: 'Skewered char-grilled paneer cubes, capsicum and tomatoes served over buttered rice with a tangy pepper sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Stuffed Mushroom in Smoked Barbeque Sauce Sizzler',
    categoryId: 'cat-pasta',
    price: 680,
    description: 'Cheese and herb stuffed mushrooms served sizzling with smoked BBQ glaze, french fries and grilled greens.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Asian Fire Sizzler',
    categoryId: 'cat-pasta',
    price: 640,
    description: 'Fiery stir-fry rice and noodles served with Indo-Chinese vegetable balls and cottage cheese on a smoking hot plate.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Teppanyaki Sizzler',
    categoryId: 'cat-pasta',
    price: 660,
    description: 'Wok-tossed Japanese noodles, yakitori glazed vegetables and grilled cottage cheese served sizzling.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Chef\'s Special Sizzler',
    categoryId: 'cat-pasta',
    price: 730,
    description: 'Chef\'s ultimate gourmet sizzling creation with assorted continental and oriental delicacies on a smoking cast-iron platter.',
    isJain: false,
    isChefSpecial: true
  },

  // --- Page 19-21: BRICK OVEN PIZZA & APPETIZERS ---
  {
    name: 'Creamy Spinach Corn Wild Mushroom & 3 Cheese Toast',
    categoryId: 'cat-pizza',
    price: 390,
    description: 'Toasted artisan bread topped with creamy sautéed spinach, sweet corn, wild mushrooms and a blend of three melted cheeses.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Sundried Tomato Ricotta Toast',
    categoryId: 'cat-pizza',
    price: 340,
    description: 'Crispy rustic toast layered with Italian sun-dried tomatoes, whipped ricotta cheese and fresh basil.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Vegetable Bruschetta',
    categoryId: 'cat-pizza',
    price: 370,
    description: 'Toasted garlic baguette topped with ripe marinated plum tomatoes, fresh sweet basil and extra virgin olive oil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Garlic Bread',
    categoryId: 'cat-pizza',
    price: 250,
    description: 'Freshly baked artisan baguette infused with roasted garlic butter and smothered with melted mozzarella.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Tomato Chilly Toast',
    categoryId: 'cat-pizza',
    price: 299,
    description: 'Crisp toast topped with spicy green chillies, juicy tomatoes and golden baked melted cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Express Pizza',
    categoryId: 'cat-pizza',
    price: 549,
    description: 'Stone-baked pizza with pizza sauce, mozzarella cheese, onions, French beans, bell peppers, black olives and herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tandoori Paneer Delight Pizza',
    categoryId: 'cat-pizza',
    price: 560,
    description: 'Clay-oven roasted paneer, mozzarella, bell peppers, garlic, black olives and oregano on hand-stretched crust.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Mushroom Masala Pizza',
    categoryId: 'cat-pizza',
    price: 670,
    description: 'Rich pizza sauce, mozzarella cheese, fresh sliced button mushrooms, garlic, black olives and Italian herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Broccoli Corn Cheese Pizza',
    categoryId: 'cat-pizza',
    price: 720,
    description: 'Artisan pizza topped with pizza sauce, mozzarella, crisp broccoli florets, sweet corn, cherry tomatoes and red onions.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Supreme Pizza',
    categoryId: 'cat-pizza',
    price: 610,
    description: 'Loaded pizza with pizza sauce, mozzarella, crunchy capsicum, tomatoes, black olives and tender baby corn.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Chef Special Pizza',
    categoryId: 'cat-pizza',
    price: 780,
    description: 'Chef\'s secret pizza sauce, mozzarella, bell peppers, black olives, broccoli, sweet corn, red onion and cherry tomatoes.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Make Your Own Pizza',
    categoryId: 'cat-pizza',
    price: 890,
    description: 'Hand-stretched crust with pizza sauce and mozzarella — customize with any 5 gourmet toppings of your choice.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Alaskan Ranch Pizza',
    categoryId: 'cat-pizza',
    price: 560,
    description: 'Creamy ranch sauce, smoked scamorza cheese, cherry tomatoes, artichoke hearts, fresh arugula and basil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Alfredo Pizza',
    categoryId: 'cat-pizza',
    price: 610,
    description: 'White Alfredo sauce, mozzarella, ricotta cheese, red onions, garlic, olives, sautéed mushrooms and spring onions.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Pizza Al Pesto',
    categoryId: 'cat-pizza',
    price: 620,
    description: 'Fragrant basil pesto sauce, mozzarella cheese, caramelized onion relish, broccoli, olives and cherry tomatoes.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Achari Paneer Pizza',
    categoryId: 'cat-pizza',
    price: 620,
    description: 'Tangy Indian achari pickle sauce, mozzarella, spiced paneer chunks, crunchy capsicum, onions and tomatoes.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'RRR Pizza',
    categoryId: 'cat-pizza',
    price: 920,
    description: 'Chef\'s special blockbuster pizza loaded with triple gourmet cheeses, roasted bell peppers, exotic toppings and herbs.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Mexican Pizza',
    categoryId: 'cat-pizza',
    price: 680,
    description: 'Zesty Mexican sauce, refried baked beans, exotic vegetables, sweet corn, sun-dried tomatoes, mozzarella and cheddar.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Chatpata Pizza',
    categoryId: 'cat-pizza',
    price: 659,
    description: 'Marinara sauce, paneer, mozzarella and cheddar cheese topped with fresh marinated spicy chillies and onions.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Sundried Tomato Pesto Pizza',
    categoryId: 'cat-pizza',
    price: 920,
    description: 'Sun-dried tomato pesto sauce, mozzarella and aged cheddar cheese topped with fresh exotic grilled vegetables.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Margherita Pizza',
    categoryId: 'cat-pizza',
    price: 490,
    description: 'Classic Italian marinara sauce, mozzarella cheese, sun-dried tomatoes, fresh cherry tomatoes and sweet basil leaves.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Paneer Makhni Pizza',
    categoryId: 'cat-pizza',
    price: 560,
    description: 'Buttery makhani sauce, mozzarella cheese, spiced paneer cubes, red onions, tomatoes, capsicum and olives.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Spicy Vegetable Pizza',
    categoryId: 'cat-pizza',
    price: 820,
    description: 'Fiery pizza sauce, mozzarella, green chillies, French beans, zucchini, bell peppers, red onions and fresh basil.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tri Pepper Pizza',
    categoryId: 'cat-pizza',
    price: 570,
    description: 'Tangy pizza sauce, mozzarella cheese, trio of red, yellow and green bell peppers, sweet corn and black olives.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Tandoori Kebab Pizza',
    categoryId: 'cat-pizza',
    price: 810,
    description: 'Pizza sauce, mozzarella cheese, charcoal-grilled tandoori seekh kebabs, red onions and bell peppers.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Spinach Basil Pesto Pizza',
    categoryId: 'cat-pizza',
    price: 770,
    description: 'Genovese pesto, mozzarella and cheddar, roasted garlic, fresh spinach, parmesan, bell peppers, corn and olives.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cilantro Chilly Pesto Pizza',
    categoryId: 'cat-pizza',
    price: 920,
    description: 'Cilantro green chilli pesto, mozzarella, cheddar, cottage cheese cubes, crisp bell peppers and red onions.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Five Cheese Pizza',
    categoryId: 'cat-pizza',
    price: 810,
    description: 'Marinara sauce layered with five premium cheeses: Mozzarella, English Cheddar, Parmesan, Ricotta and Greek Feta.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Five Pepper Pizza',
    categoryId: 'cat-pizza',
    price: 610,
    description: 'Marinara sauce, mozzarella, cheddar, trio of bell peppers, fresh green chillies and spicy jalapeño rounds.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 22-23: INDIAN MAIN COURSE ---
  {
    name: 'Veg. Kolhapuri',
    categoryId: 'cat-main',
    price: 299,
    description: 'Assorted garden vegetables cooked in a spicy, fiery and robust Maharashtrian Kolhapuri red chilli gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Diwani Handi',
    categoryId: 'cat-main',
    price: 310,
    description: 'Medley of seasonal vegetables and cottage cheese simmered in a rich, velvety aromatic cashew and spinach gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Lazeez',
    categoryId: 'cat-main',
    price: 360,
    description: 'Tender vegetables and paneer cooked in a delectable, mildly spiced golden cashew cream sauce.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Keema Masala',
    categoryId: 'cat-main',
    price: 390,
    description: 'Finely minced soy granules and vegetables tossed with whole spices, browned onions and rich tomato gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Jaipuri',
    categoryId: 'cat-main',
    price: 389,
    description: 'Royal Rajasthani preparation of vegetables and crushed papad simmered in a spiced tomato gravy with cream.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg Patiyala',
    categoryId: 'cat-main',
    price: 340,
    description: 'Stuffed rolled papad and vegetable parcels simmered in a rich, buttery Punjabi tomato and onion gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Palak Paneer',
    categoryId: 'cat-main',
    price: 369,
    description: 'Soft cottage cheese cubes cooked in slow-simmered, garlic-tempered fresh spinach puree with cream.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Makhni',
    categoryId: 'cat-main',
    price: 389,
    description: 'Tender paneer cubes in a classic silky, mildly sweet and creamy tomato-cashew makhani gravy.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Paneer Butter Masala',
    categoryId: 'cat-main',
    price: 389,
    description: 'All-time favourite paneer preparation tossed in a rich, velvety butter and tomato makhani sauce.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Paneer Lababdar',
    categoryId: 'cat-main',
    price: 399,
    description: 'Succulent paneer cubes and grated cottage cheese simmered in a luscious onion-tomato gravy with cream and coriander.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Lasooni Paneer',
    categoryId: 'cat-main',
    price: 399,
    description: 'Cottage cheese cooked in a flavour-packed curry heavily infused with roasted golden garlic and whole spices.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Kadai',
    categoryId: 'cat-main',
    price: 389,
    description: 'Cottage cheese, crunchy bell peppers and onions tossed with freshly ground roasted coriander and kadai masala.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Cheese Tikka Masala',
    categoryId: 'cat-main',
    price: 399,
    description: 'Char-grilled tandoori paneer tikka finished in a spiced masala gravy topped with melted cheese.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Pasanda',
    categoryId: 'cat-main',
    price: 420,
    description: 'Paneer sandwiches stuffed with dry fruits and mawa, shallow-fried and served in a rich cashew saffron sauce.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Paneer Keema Masala',
    categoryId: 'cat-main',
    price: 339,
    description: 'Finely grated fresh paneer cooked in a rustic, spiced dhaba-style onion and tomato gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Mushroom Tikka Masala',
    categoryId: 'cat-main',
    price: 420,
    description: 'Clay-oven roasted button mushrooms simmered in a robust, spiced Punjabi onion-tomato gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Malai Kofta',
    categoryId: 'cat-main',
    price: 420,
    description: 'Melt-in-mouth cottage cheese and mawa dumplings simmered in a royal, silky white cashew cream gravy.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Sesamee Kofta',
    categoryId: 'cat-main',
    price: 450,
    description: 'Crispy sesame-crusted vegetable kofta dumplings served in an exotic, aromatic spiced gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Kofta',
    categoryId: 'cat-main',
    price: 540,
    description: 'Handcrafted dumplings filled with molten cheese, simmered in a luxurious rich makhani gravy.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Kaju Kofta',
    categoryId: 'cat-main',
    price: 360,
    description: 'Dumplings made with cashews, potatoes and mawa served in a mildly spiced golden cashew sauce.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Kaju Masala',
    categoryId: 'cat-main',
    price: 462,
    description: 'Golden roasted whole cashew nuts cooked in a spicy, full-flavoured Punjabi onion and tomato masala.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Kaju Curry',
    categoryId: 'cat-main',
    price: 469,
    description: 'Premium roasted cashews simmered in a velvety, rich and aromatic cashew-onion gravy.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Kaju Makhanwala',
    categoryId: 'cat-main',
    price: 499,
    description: 'Rich roasted cashews slow-cooked in a buttery, creamy and mildly sweet tomato makhani sauce.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Soya Chap Curry',
    categoryId: 'cat-main',
    price: 449,
    description: 'Tender tandoori soya chaap chunks cooked in a fragrant, thick spiced North Indian gravy.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Butter Masala',
    categoryId: 'cat-main',
    price: 449,
    description: 'Cubes and generous shreds of Amul cheese cooked in a rich, buttery tomato makhani sauce.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Lasooni Palak Mushroom',
    categoryId: 'cat-main',
    price: 399,
    description: 'Fresh button mushrooms tossed with garlic-infused spinach puree and finished with fresh cream.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Lasooni Soya Chap',
    categoryId: 'cat-main',
    price: 449,
    description: 'Tender soya chaap pieces cooked in a fragrant curry highlighted with slow-roasted golden garlic.',
    isJain: false,
    isChefSpecial: false
  },

  // --- Page 23: INDIAN BREADS ---
  {
    name: 'Roti (Plain / Butter)',
    categoryId: 'cat-breads',
    price: 49,
    description: 'Traditional unleavened whole wheat flatbread baked fresh in the clay oven (Available Plain ₹45 or Butter ₹49).',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Missi Roti',
    categoryId: 'cat-breads',
    price: 70,
    description: 'Nutritious flatbread made with seasoned gram flour and whole wheat, spiced with ajwain and herbs.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Laccha Paratha',
    categoryId: 'cat-breads',
    price: 105,
    description: 'Multi-layered flaky whole wheat bread baked in tandoor and brushed generously with butter.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Naan (Plain / Butter)',
    categoryId: 'cat-breads',
    price: 89,
    description: 'Classic leavened flatbread made from refined flour, baked soft and bubbly in clay oven (Plain ₹75 / Butter ₹89).',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Kashmiri Naan',
    categoryId: 'cat-breads',
    price: 199,
    description: 'Soft tandoori naan stuffed with dried fruits, nuts, tutty-fruity and mild aromatic spices.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Chilli Garlic Naan',
    categoryId: 'cat-breads',
    price: 139,
    description: 'Crispy tandoori naan topped with fiery green chillies and minced golden garlic.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Cheese Garlic Naan',
    categoryId: 'cat-breads',
    price: 159,
    description: 'Tandoori naan stuffed with melted cheese and topped with aromatic roasted garlic and fresh coriander.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Kulcha (Plain / Butter)',
    categoryId: 'cat-breads',
    price: 110,
    description: 'Soft leavened tandoori bread garnished with sesame seeds and fresh coriander (Plain ₹90 / Butter ₹110).',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cheese Kulcha',
    categoryId: 'cat-breads',
    price: 159,
    description: 'Soft leavened bread stuffed with melted mozzarella and processed cheese, baked in clay oven.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Masala Kulcha',
    categoryId: 'cat-breads',
    price: 160,
    description: 'Fluffy tandoori bread stuffed with spiced potatoes, onions, green chillies and fragrant herbs.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Bread Basket',
    categoryId: 'cat-breads',
    price: 390,
    description: 'Grand assorted basket with Roti, Missi Roti, Laccha Paratha, Cheese Garlic Naan and Masala Kulcha.',
    isJain: false,
    isChefSpecial: true
  },

  // --- Page 24: RICE, BIRYANI, DAL & CURD ---
  {
    name: 'Steamed Rice',
    categoryId: 'cat-dal-rice',
    price: 190,
    description: 'Fluffy steamed long-grain premium basmati rice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Jeera Rice',
    categoryId: 'cat-dal-rice',
    price: 199,
    description: 'Aromatic basmati rice tempered with roasted cumin seeds and desi cow ghee.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Kashmiri Pulao',
    categoryId: 'cat-dal-rice',
    price: 258,
    description: 'Mildly sweet and fragrant basmati pulao tossed with saffron, fresh fruits and roasted dry fruits.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Chef\'s Special Dal Khichdi',
    categoryId: 'cat-dal-rice',
    price: 259,
    description: 'Comforting slow-cooked yellow lentils and basmati rice tempered with garlic, cumin, hing and desi ghee.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Veg. Dum Biryani',
    categoryId: 'cat-dal-rice',
    price: 340,
    description: 'Layers of aromatic basmati rice and marinated seasonal vegetables slow-cooked in a sealed handi with saffron.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Veg. Hyderabadi Dum Biryani',
    categoryId: 'cat-dal-rice',
    price: 340,
    description: 'Spicy and fragrant Nizami style biryani infused with fresh mint, coriander, brown onions and saffron.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Paneer Tikka Dum Biryani',
    categoryId: 'cat-dal-rice',
    price: 380,
    description: 'Smoky tandoori paneer tikka pieces layered with fragrant spiced basmati rice and cooked on dum.',
    isJain: false,
    isChefSpecial: true
  },
  {
    name: 'Dal Fry / Dal Tadka',
    categoryId: 'cat-dal-rice',
    price: 240,
    description: 'Yellow toor lentils cooked to perfection and double-tempered with cumin seeds, garlic, onions, tomatoes and ghee.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Lasooni Dal Palak',
    categoryId: 'cat-dal-rice',
    price: 259,
    description: 'Nutritious yellow lentils and fresh spinach tempered with extra golden roasted garlic and whole red chillies.',
    isJain: false,
    isChefSpecial: false
  },
  {
    name: 'Dal Makhani',
    categoryId: 'cat-dal-rice',
    price: 270,
    description: 'Authentic slow-cooked black urad lentils and kidney beans simmered overnight with butter, cream and whole spices.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Tadka Wala Dahi',
    categoryId: 'cat-dal-rice',
    price: 259,
    description: 'Fresh thick creamy curd tempered with mustard seeds, curry leaves, cumin and whole red chillies.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Plain Curd',
    categoryId: 'cat-dal-rice',
    price: 60,
    description: 'Fresh, chilled and wholesome homestyle set curd.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Veg. Raita / Boondi Raita',
    categoryId: 'cat-dal-rice',
    price: 99,
    description: 'Chilled whipped yogurt seasoned with roasted cumin and mixed with diced vegetables or crispy fried boondi.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Pineapple / Mix Fruit Raita',
    categoryId: 'cat-dal-rice',
    price: 120,
    description: 'Sweetened creamy chilled yogurt tossed with juicy pineapple chunks and fresh seasonal fruits.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 25: DESSERT & EXTRA'S ---
  {
    name: 'Shahi Tukda',
    categoryId: 'cat-desserts',
    price: 250,
    description: 'Royal Hyderabadi dessert of crisp ghee-fried bread soaked in fragrant sugar syrup and topped with thick rabdi and dry fruits.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Chocolate Brownie',
    categoryId: 'cat-desserts',
    price: 230,
    description: 'Warm, fudgy dark chocolate walnut brownie baked with premium Belgian cocoa.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Sizzling Chocolate Brownie with Ice-Cream',
    categoryId: 'cat-desserts',
    price: 330,
    description: 'Warm chocolate brownie served on a smoking hot sizzler plate, crowned with vanilla ice cream and hot chocolate fudge.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Hot Gulab Jamun',
    categoryId: 'cat-desserts',
    price: 330,
    description: 'Soft, golden khoya dumplings fried in pure ghee and soaked in warm rose and cardamom scented sugar syrup.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hot Gulab Jamun with Ice Cream',
    categoryId: 'cat-desserts',
    price: 330,
    description: 'Warm, melt-in-mouth gulab jamuns paired with a scoop of chilled rich vanilla bean ice cream.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Chocolate Roll (4 Pcs)',
    categoryId: 'cat-desserts',
    price: 330,
    description: 'Crispy handcrafted dessert rolls stuffed with molten Belgian chocolate and dusted with icing sugar.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Extra Cheese',
    categoryId: 'cat-desserts',
    price: 60,
    description: 'Portion of extra shredded Amul or Mozzarella cheese add-on.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Extra Dip',
    categoryId: 'cat-desserts',
    price: 60,
    description: 'Extra portion of gourmet dip or sauce of your choice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Extra Veggies',
    categoryId: 'cat-desserts',
    price: 60,
    description: 'Extra portion of sautéed fresh seasonal vegetables.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 27: HOT COFFEE ---
  {
    name: 'Espresso',
    categoryId: 'cat-beverages',
    price: 130,
    description: 'Bold, intense single shot of concentrated artisanal espresso with rich golden crema.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Caffe Americano',
    categoryId: 'cat-beverages',
    price: 140,
    description: 'Fresh espresso shot diluted with hot purified water, preserving the deep coffee aroma.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Caffe Romano',
    categoryId: 'cat-beverages',
    price: 150,
    description: 'Authentic Italian espresso served with a fresh twist of lemon peel to enhance sweetness and cut bitterness.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Caffe Macchiato',
    categoryId: 'cat-beverages',
    price: 140,
    description: 'Rich espresso shot stained with a delicate dollop of warm textured milk foam.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cappuccino',
    categoryId: 'cat-beverages',
    price: 165,
    description: 'Classic balance of espresso, velvety steamed milk and a thick layer of airy milk foam dusted with cocoa.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Biscoff Cappuccino',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Creamy espresso cappuccino infused with caramelized Belgian Lotus Biscoff spread.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Caffe Latte',
    categoryId: 'cat-beverages',
    price: 180,
    description: 'Smooth espresso blended with generous velvety steamed milk and a thin layer of microfoam.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cinnamon Latte',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Comforting café latte infused with aromatic freshly ground organic Ceylon cinnamon spice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Caffe Mocha',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Espresso combined with rich Belgian dark chocolate and creamy steamed milk.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cardamom Mocha',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Royal fusion of rich dark chocolate mocha infused with the warm fragrance of green cardamom.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cortado',
    categoryId: 'cat-beverages',
    price: 165,
    description: 'Spanish style espresso cut with an equal volume of warm steamed milk to reduce acidity.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Flat White',
    categoryId: 'cat-beverages',
    price: 180,
    description: 'Double ristretto shot topped with glossy, velvety microfoam for a smooth, strong coffee taste.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 28: ICED COFFEE ---
  {
    name: 'Classic Cold Coffee',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Traditional chilled blended coffee made with rich milk, sugar and vanilla cream.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Affogato',
    categoryId: 'cat-beverages',
    price: 165,
    description: 'A generous scoop of premium vanilla bean ice cream drowned in a hot, freshly pulled shot of espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Brownie Affogato',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Fudgy brownie chunk and vanilla ice cream drenched in a bold shot of hot espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cold Brew',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Artisanal 16-hour slow steep cold water extracted coffee served over crystal clear ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cold Brew Tonic',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Sparkling botanical tonic water layered with bold, smooth artisanal cold brew coffee.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cold Brew Ginger Ale',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Spicy effervescent ginger ale layered over refreshing slow-steeped cold brew.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cold Brew Lemonade',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Zesty freshly squeezed lemon juice paired with cold brew coffee over ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Honey Blend Cold Brew Tonic',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Smooth cold brew and tonic water naturally sweetened with pure organic wild honey.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Coffee Mojito',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Muddled fresh mint leaves, lime and bubbly soda layered with rich chilled coffee.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cranberry with Espresso',
    categoryId: 'cat-beverages',
    price: 275,
    description: 'Sweet-tart cranberry nectar topped with a bold shot of chilled espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Espresso Tonic',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Double shot of espresso poured over chilled sparkling tonic water with citrus peel.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Tropical Espresso Tonic',
    categoryId: 'cat-beverages',
    price: 260,
    description: 'Passion fruit and tropical citrus tonic topped with freshly pulled espresso over ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Orange Espresso',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Pure fresh orange juice layered with a bold espresso shot over ice cubes.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Espresso with Coke',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Chilled effervescent Coca-Cola infused with a rich shot of espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Espresso Martini (Mocktail)',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Non-alcoholic shaken iced espresso mocktail with vanilla, chocolate notes and creamy foam.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Yuzu Rose Cold Brew Tonic',
    categoryId: 'cat-beverages',
    price: 275,
    description: 'Japanese yuzu citrus, delicate Damascus rose essence and cold brew tonic water.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Ice Cappuccino',
    categoryId: 'cat-beverages',
    price: 180,
    description: 'Chilled espresso shaken with cold milk and crowned with dense, cool milk foam.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 29: ICED COFFEE & MANUAL BREW ---
  {
    name: 'Ice Mocha',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Chilled espresso and rich chocolate blended over ice cubes.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Hazelnut Mocha',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Iced chocolate espresso infused with toasted hazelnut syrup.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Spanish Latte',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Bold espresso poured over sweet condensed milk and chilled fresh milk.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Nutella Latte',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Creamy iced latte swirled with genuine Nutella hazelnut spread.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Caramel Macchiato',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Chilled vanilla milk marked with bold espresso and drizzled with buttery caramel sauce.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Mazagran',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Traditional Portuguese iced sweetened coffee served with fresh lemon juice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Mazagran Tonic',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Sparkling lemon tonic infused with iced coffee and mint.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Katingdaeng Coffee',
    categoryId: 'cat-beverages',
    price: 299,
    description: 'Signature iced coffee energy blend crafted for maximum refreshment and kick.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hot Pour Over',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Hand-poured single origin specialty coffee brewed through V60 filter.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Pour Over',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'V60 pour over coffee brewed directly over ice for clean, bright and crisp flavor notes.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hot Aero-Press',
    categoryId: 'cat-beverages',
    price: 210,
    description: 'Clean, full-bodied immersion coffee pressed through a fine micro-filter.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Ice Aero-Press',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Chilled, remarkably smooth AeroPress coffee extraction served over ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Syphon Coffee',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Theatrical vacuum-brewed aromatic cup of coffee delivering clean, tea-like clarity.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'French-Press Coffee',
    categoryId: 'cat-beverages',
    price: 210,
    description: 'Classic full immersion brewed coffee boasting rich body and bold roasted aromas.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Red Eye Coffee',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Fresh drip coffee spiked with an extra single shot of espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Black Eye Coffee',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Fresh drip coffee supercharged with two shots of espresso.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Dead Eyes Coffee',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'High-octane drip coffee supercharged with three bold shots of espresso.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 30: FRAPPES & ICE-CREAM BLENDS ---
  {
    name: 'Classic Frappe',
    categoryId: 'cat-beverages',
    price: 165,
    description: 'Blended iced coffee beverage topped with whipped milk foam.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Vanilla Frappe',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Frosty coffee blended with Madagascar vanilla ice cream and milk.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Caramel Frappe',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Blended coffee with buttery caramel sauce, cream and crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hazelnut Frappe',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Iced coffee frappe flavored with roasted hazelnut syrup.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Irish Frappe',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Creamy coffee frappe infused with non-alcoholic Irish cream notes.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hazelnut Irish Frappe',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Delightful fusion of roasted hazelnut and Irish cream blended frappe.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Mocha Frappe',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Rich Dutch cocoa and espresso blended with crushed ice and cream.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Signature Frappe',
    categoryId: 'cat-beverages',
    price: 250,
    description: 'Chef\'s signature decadent frappe garnished with chocolate flakes and caramel drizzle.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Ice-Cream Blend',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Double shot of rich espresso blended with premium vanilla ice-cream.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Chocolate Blend',
    categoryId: 'cat-beverages',
    price: 330,
    description: 'Double shot espresso, chocolate ice-cream and molten chocolate fudge.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Brownie Blend',
    categoryId: 'cat-beverages',
    price: 330,
    description: 'Double shot coffee blended with vanilla ice-cream and crumbled fudge brownie.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Oreo Blend',
    categoryId: 'cat-beverages',
    price: 440,
    description: 'Double shot coffee, vanilla ice-cream and crunchy Oreo cookie crumbs.',
    isJain: true,
    isChefSpecial: false
  },

  // --- Page 31: BLENDS, SHAKES & HOT CHOCOLATE ---
  {
    name: 'Nutella Blend',
    categoryId: 'cat-beverages',
    price: 265,
    description: 'Double shot coffee, ice-cream and genuine creamy Nutella spread.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Biscoff Blend',
    categoryId: 'cat-beverages',
    price: 280,
    description: 'Double shot coffee, ice-cream and caramelized Lotus Biscoff spread.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Vanilla Shake',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Classic thick milkshake made with pure vanilla bean ice cream and fresh milk.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Chocolate Shake',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Thick, indulgent milkshake crafted with Belgian chocolate ice cream.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Brownie Oreo Shake',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Loaded thick shake blended with fudge brownies and crunchy Oreo cookies.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Peanut Butter and Kaju Shake',
    categoryId: 'cat-beverages',
    price: 240,
    description: 'Wholesome, protein-rich thick shake of roasted cashews and creamy peanut butter.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Classic Hot Chocolate',
    categoryId: 'cat-beverages',
    price: 165,
    description: 'Velvety smooth steamed milk blended with rich melted European chocolate.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Hazelnut Caramel Hot Chocolate',
    categoryId: 'cat-beverages',
    price: 190,
    description: 'Warm hot chocolate infused with toasted hazelnut notes and buttery caramel.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Nutella Hot Chocolate',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Steaming hot chocolate swirled with generous creamy Nutella hazelnut spread.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Biscoff Hot Chocolate',
    categoryId: 'cat-beverages',
    price: 199,
    description: 'Warm spiced hot chocolate blended with caramelized Lotus Biscoff spread.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Signature Hot Chocolate',
    categoryId: 'cat-beverages',
    price: 220,
    description: 'Extra-thick gourmet dark hot chocolate served with fluffy marshmallows.',
    isJain: true,
    isChefSpecial: true
  },

  // --- Page 32: ICE TEAS & MOCKTAILS ---
  {
    name: 'Lemon Ice Tea',
    categoryId: 'cat-mocktails',
    price: 160,
    description: 'Chilled Ceylon black tea infused with freshly squeezed lemon juice and mint.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Peach Ice Tea',
    categoryId: 'cat-mocktails',
    price: 170,
    description: 'Refreshing iced tea infused with sweet, fragrant sun-ripened peach nectar.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Citrus Ice Tea',
    categoryId: 'cat-mocktails',
    price: 199,
    description: 'Zesty blend of fresh orange, lime and chilled brewed tea over ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Rose Ice Tea',
    categoryId: 'cat-mocktails',
    price: 199,
    description: 'Delicate aromatic iced tea scented with Damascus rose petals and lemon.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Cranberry Ice Tea',
    categoryId: 'cat-mocktails',
    price: 220,
    description: 'Tart cranberry juice blended with crisp iced tea and citrus slices.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Redbull Ice Tea',
    categoryId: 'cat-mocktails',
    price: 240,
    description: 'Iced tea energized with Red Bull energy drink for an instant refreshing kick.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Love Potion',
    categoryId: 'cat-mocktails',
    price: 230,
    description: 'Exotic mocktail of strawberry, ginger, lime, grenadine, kaffir lime and lemongrass.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Nostalgia',
    categoryId: 'cat-mocktails',
    price: 280,
    description: 'Playful mocktail with bubblegum flavour, fresh lemon, mint and strawberries.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Strawberry & Lime Cooler',
    categoryId: 'cat-mocktails',
    price: 220,
    description: 'Fresh strawberries, zesty lime, ginger and cooling soda over crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Yuzu Cooler',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Japanese yuzu citrus, fresh orange, lemon juice and sparkling soda.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'La-Pino Cooler',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Tropical refresher crafted with pineapple, crisp green apple, red apple and lemon.',
    isJain: true,
    isChefSpecial: true
  },

  // --- Page 33: MOCKTAILS & SOFT DRINKS ---
  {
    name: 'Mango Mule',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Fresh mango nectar, pure wild honey, cucumber slices, ginger and lemon with fizz.',
    isJain: true,
    isChefSpecial: true
  },
  {
    name: 'Mojito (Mint, Lemon & Flavours)',
    categoryId: 'cat-mocktails',
    price: 210,
    description: 'Refreshing classic or flavoured mojito with muddled mint and lime (Available in Mint, Cranberry, Orange, Watermelon, Mango Spicy).',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Pina Colada',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Tropical frozen blend of sweet pineapple juice, rich coconut cream and crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Pina Breeze',
    categoryId: 'cat-mocktails',
    price: 270,
    description: 'Breezy tropical cooler of pineapple, fresh mint, lime and sparkling soda.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Golden River',
    categoryId: 'cat-mocktails',
    price: 250,
    description: 'Golden passion fruit, fresh orange and sweet pineapple cooler.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Strawberry Delight',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Sweet strawberry puree blended with cream, lime and effervescent soda.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Kiwi Colour',
    categoryId: 'cat-mocktails',
    price: 240,
    description: 'Tangy crushed kiwi fruit mocktail with fresh mint leaves, lime and crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Bubbleeco',
    categoryId: 'cat-mocktails',
    price: 270,
    description: 'Fun bubblegum and berry flavored sparkling mocktail served over crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Black Currant Cooler',
    categoryId: 'cat-mocktails',
    price: 260,
    description: 'Rich, tart European blackcurrant cooler with fresh mint and fizzy soda.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Blue Heaven',
    categoryId: 'cat-mocktails',
    price: 280,
    description: 'Vibrant blue curaçao syrup, fresh lime and chilled Sprite with crushed ice.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Banana with Kaju Shake',
    categoryId: 'cat-beverages',
    price: 280,
    description: 'Rich, thick wholesome shake made with sweet bananas, cashews, honey and milk.',
    isJain: true,
    isChefSpecial: false
  },
  {
    name: 'Any Available Soft Drinks',
    categoryId: 'cat-mocktails',
    price: 79,
    description: 'Chilled canned or bottled aerated soft drinks (Coke, Thums Up, Sprite, Fanta).',
    isJain: true,
    isChefSpecial: false
  }
];

// Helper: Normalize dish names for exact deduplication
function normalizeName(str) {
  return str
    .toLowerCase()
    .replace(/\b(soup|salad|pizza|shake|cooler|fondue|sizzler|frappe|blend|pasta)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function runImport() {
  console.log('🚀 Loading database and cloud data...');
  const dbPath = path.join(__dirname, 'data', 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Map category ID to Category Name
  const catMap = {};
  db.categories.forEach(c => {
    catMap[c.id] = c.name;
  });

  const existingItems = db.items || [];
  console.log(`Initial items in db.json: ${existingItems.length}`);

  // Deduplication map: key is normalized name
  const itemMap = new Map();

  // 1. First, populate itemMap with existing items
  existingItems.forEach(item => {
    const key = normalizeName(item.name);
    // Ensure no portion or prepTime exists
    const cleanItem = {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      categoryName: catMap[item.categoryId] || item.categoryName,
      price: item.price,
      description: item.description,
      image: item.image || categoryImageMap[item.categoryId] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isAvailable: false, // User instructed: in sab item ko abhi sold out rakhna
      isJain: !!item.isJain,
      isChefSpecial: !!item.isChefSpecial,
      isBestseller: !!item.isBestseller,
      customOptions: item.customOptions || []
    };
    itemMap.set(key, cleanItem);
  });

  let addedCount = 0;
  let updatedCount = 0;

  // 2. Iterate through all PDF items
  pdfItems.forEach((pItem, idx) => {
    const key = normalizeName(pItem.name);
    const catName = catMap[pItem.categoryId] || 'Specialty';

    if (itemMap.has(key)) {
      // Item already exists -> Update price, description if needed, and ensure SOLD OUT
      const existing = itemMap.get(key);
      existing.price = pItem.price;
      if (pItem.description && pItem.description.length > (existing.description || '').length) {
        existing.description = pItem.description;
      }
      existing.isAvailable = false; // User requested: all sold out
      if (pItem.isJain !== undefined) existing.isJain = pItem.isJain;
      if (pItem.isChefSpecial !== undefined) existing.isChefSpecial = pItem.isChefSpecial;
      updatedCount++;
    } else {
      // New item from PDF -> Add with proper description, default image, sold out
      const newItem = {
        id: `pdf-dish-${Date.now().toString(36)}-${idx + 1}`,
        name: pItem.name,
        categoryId: pItem.categoryId,
        categoryName: catName,
        price: pItem.price,
        description: pItem.description,
        image: categoryImageMap[pItem.categoryId] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isAvailable: false, // User requested: in sab item ko abhi sold out rakhna
        isJain: !!pItem.isJain,
        isChefSpecial: !!pItem.isChefSpecial,
        isBestseller: false,
        customOptions: []
      };
      itemMap.set(key, newItem);
      addedCount++;
    }
  });

  const finalItems = Array.from(itemMap.values());
  console.log(`✅ Deduplication complete!`);
  console.log(`- Updated existing: ${updatedCount}`);
  console.log(`- Newly added: ${addedCount}`);
  console.log(`- Total unique dishes: ${finalItems.length}`);

  db.items = finalItems;

  // Save to data/db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`💾 Saved updated catalog to data/db.json`);

  // Sync to Firebase Cloud
  try {
    const fbUrl = 'https://la-mensa-menu-default-rtdb.firebaseio.com/menu.json';
    const putRes = await fetch(fbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
    console.log(`☁️ Firebase Cloud PUT status: ${putRes.status}`);
  } catch (err) {
    console.error('Firebase sync warning:', err);
  }
}

runImport().catch(console.error);
