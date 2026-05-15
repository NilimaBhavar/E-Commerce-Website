// Seed script — run with: pnpm --filter tara-shop-server run seed
// This inserts the admin user, all 12 categories, and 33 Indian products
require('dotenv').config({ path: require('path').join(__dirname, '../../..', '.env') });
// Try parent .env too (for Replit env setup)
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const CATEGORIES = [
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup and beauty essentials', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300' },
  { name: 'Biscuits', slug: 'biscuits', description: 'Cookies, crackers and biscuits', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300' },
  { name: 'Chocolates', slug: 'chocolates', description: 'Chocolates and candy', imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300' },
  { name: 'Cleaning', slug: 'cleaning', description: 'Household cleaning products', imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300' },
  { name: 'Beverages', slug: 'beverages', description: 'Drinks, juices and health drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
  { name: 'Hair Care', slug: 'hair-care', description: 'Shampoo, conditioner and hair oils', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300' },
  { name: 'Household', slug: 'household', description: 'Home and household essentials', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300' },
  { name: 'Oral Care', slug: 'oral-care', description: 'Toothpaste, brushes and mouthwash', imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300' },
  { name: 'Packaged Food', slug: 'packaged-food', description: 'Ready-to-eat and packaged food', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300' },
  { name: 'Snacks', slug: 'snacks', description: 'Chips, namkeen and snacks', imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=300' },
  { name: 'Soaps', slug: 'soaps', description: 'Bath soaps and body wash', imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300' },
  { name: 'Stationery', slug: 'stationery', description: 'Notebooks, pens and stationery', imageUrl: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=300' },
];

function getProducts(cats) {
  const bySlug = {};
  cats.forEach((c) => { bySlug[c.slug] = c._id; });

  return [
    // Biscuits
    { name: "Parle-G Original Glucose Biscuits", price: 10, originalPrice: 12, discount: 17, stock: 200, isFeatured: true, category: bySlug['biscuits'], brand: "Parle", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", description: "India's favourite biscuit - light, crispy glucose biscuits perfect with tea." },
    { name: "Britannia Bourbon Biscuits", price: 30, originalPrice: 35, discount: 14, stock: 150, isFeatured: true, category: bySlug['biscuits'], brand: "Britannia", imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400", description: "Rich chocolate cream sandwiched between two crispy biscuits." },
    { name: "Good Day Cashew Cookies", price: 40, stock: 120, isFeatured: false, category: bySlug['biscuits'], brand: "Britannia", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", description: "Buttery cookies loaded with whole cashews." },

    // Chocolates
    { name: "Amul Dark Chocolate 150g", price: 99, originalPrice: 120, discount: 18, stock: 80, isFeatured: true, category: bySlug['chocolates'], brand: "Amul", imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400", description: "Pure dark chocolate with 55% cocoa for the discerning chocolate lover." },
    { name: "Kit Kat 4 Finger", price: 40, originalPrice: 45, discount: 11, stock: 200, isFeatured: true, category: bySlug['chocolates'], brand: "Nestle", imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400", description: "Break time just got better with crispy wafer fingers coated in milk chocolate." },
    { name: "Cadbury Dairy Milk 162g", price: 120, originalPrice: 135, discount: 11, stock: 100, isFeatured: false, category: bySlug['chocolates'], brand: "Cadbury", imageUrl: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=400", description: "The classic Indian chocolate — smooth, creamy milk chocolate everyone loves." },

    // Packaged Food
    { name: "Maggi 2-Minute Noodles (Pack of 12)", price: 120, originalPrice: 144, discount: 17, stock: 250, isFeatured: true, category: bySlug['packaged-food'], brand: "Nestle", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", description: "India's most loved instant noodles — ready in just 2 minutes." },
    { name: "Aashirvaad Atta 5kg", price: 250, originalPrice: 280, discount: 11, stock: 80, isFeatured: false, category: bySlug['packaged-food'], brand: "ITC", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", description: "Premium whole wheat flour for soft, nutritious rotis every day." },
    { name: "Tata Salt 1kg", price: 22, stock: 300, isFeatured: false, category: bySlug['packaged-food'], brand: "Tata", imageUrl: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400", description: "India's most trusted iodized salt — pure and essential." },

    // Snacks
    { name: "Haldiram's Aloo Bhujia 400g", price: 90, originalPrice: 105, discount: 14, stock: 160, isFeatured: true, category: bySlug['snacks'], brand: "Haldiram's", imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400", description: "Crispy, spicy potato noodles — the ultimate namkeen snack." },
    { name: "Lay's Classic Salted Chips 104g", price: 30, stock: 200, isFeatured: false, category: bySlug['snacks'], brand: "Lay's", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400", description: "Thin, crispy potato chips with the perfect amount of salt." },
    { name: "Kurkure Masala Munch 100g", price: 25, stock: 250, isFeatured: false, category: bySlug['snacks'], brand: "PepsiCo", imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400", description: "The tangy, masala-flavoured corn puffs that India loves to munch." },

    // Beverages
    { name: "Tropicana Orange Juice 1L", price: 110, originalPrice: 130, discount: 15, stock: 90, isFeatured: true, category: bySlug['beverages'], brand: "Tropicana", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", description: "Fresh-tasting orange juice with no added preservatives." },
    { name: "Bisleri Mineral Water 1L", price: 20, stock: 500, isFeatured: false, category: bySlug['beverages'], brand: "Bisleri", imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", description: "Pure, safe and healthy mineral water for everyday hydration." },
    { name: "Horlicks Classic Malt 500g", price: 210, originalPrice: 240, discount: 13, stock: 70, isFeatured: false, category: bySlug['beverages'], brand: "GSK", imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400", description: "Nutritious malt drink that supports growth and immunity in kids." },

    // Hair Care
    { name: "Clinic Plus Shampoo 340ml", price: 120, originalPrice: 140, discount: 14, stock: 110, isFeatured: false, category: bySlug['hair-care'], brand: "HUL", imageUrl: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400", description: "Nourishing shampoo with milk proteins for strong, healthy hair." },
    { name: "Parachute Coconut Oil 500ml", price: 150, originalPrice: 175, discount: 14, stock: 130, isFeatured: true, category: bySlug['hair-care'], brand: "Marico", imageUrl: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400", description: "100% pure coconut oil for deep nourishment and hair growth." },
    { name: "Head & Shoulders Anti-Dandruff 340ml", price: 249, originalPrice: 280, discount: 11, stock: 85, isFeatured: false, category: bySlug['hair-care'], brand: "P&G", imageUrl: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400", description: "Clinically proven formula to remove dandruff with regular use." },

    // Oral Care
    { name: "Colgate Strong Teeth Toothpaste 300g", price: 99, originalPrice: 115, discount: 14, stock: 150, isFeatured: false, category: bySlug['oral-care'], brand: "Colgate", imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400", description: "Strengthens teeth with active calcium and fluoride protection." },
    { name: "Sensodyne Sensitive Toothpaste 70g", price: 130, originalPrice: 150, discount: 13, stock: 90, isFeatured: false, category: bySlug['oral-care'], brand: "GSK", imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400", description: "Specially formulated for sensitive teeth — protects against pain." },
    { name: "Listerine Cool Mint 250ml", price: 140, originalPrice: 160, discount: 13, stock: 75, isFeatured: false, category: bySlug['oral-care'], brand: "J&J", imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400", description: "Kills 99.9% of germs and leaves breath fresh for 12 hours." },

    // Soaps
    { name: "Dettol Original Soap 75g (Pack of 4)", price: 120, originalPrice: 140, discount: 14, stock: 200, isFeatured: true, category: bySlug['soaps'], brand: "Reckitt", imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", description: "Germ protection soap trusted by Indian families for generations." },
    { name: "Dove Beauty Cream Bar 100g", price: 75, stock: 160, isFeatured: false, category: bySlug['soaps'], brand: "HUL", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400", description: "1/4 moisturising cream formula for soft, smooth skin after every wash." },
    { name: "Pears Pure & Gentle Soap 75g", price: 55, stock: 180, isFeatured: false, category: bySlug['soaps'], brand: "HUL", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", description: "India's most iconic transparent soap with natural glycerine." },

    // Cleaning
    { name: "Rin Advanced Powder 1kg", price: 85, originalPrice: 100, discount: 15, stock: 120, isFeatured: false, category: bySlug['cleaning'], brand: "HUL", imageUrl: "https://images.unsplash.com/photo-1585003029620-30028aee3d0e?w=400", description: "Advanced whitening detergent for sparkling clean clothes." },
    { name: "Harpic Power Plus 500ml", price: 99, originalPrice: 115, discount: 14, stock: 90, isFeatured: false, category: bySlug['cleaning'], brand: "Reckitt", imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400", description: "Powerful toilet cleaner that kills 99.9% of germs and removes stains." },
    { name: "Colin Glass & Surface Cleaner 500ml", price: 90, stock: 100, isFeatured: false, category: bySlug['cleaning'], brand: "Reckitt", imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400", description: "Streak-free shine on glass, tiles and all hard surfaces." },

    // Beauty
    { name: "Pond's Super Light Gel 75g", price: 199, originalPrice: 230, discount: 13, stock: 80, isFeatured: true, category: bySlug['beauty'], brand: "HUL", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", description: "Lightweight moisturiser with hyaluronic acid for oil-free hydration." },
    { name: "Lakme 9to5 Vitamin C Serum 15ml", price: 349, originalPrice: 399, discount: 13, stock: 60, isFeatured: true, category: bySlug['beauty'], brand: "Lakme", imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400", description: "Brightening serum with Vitamin C for glowing, even-toned skin." },
    { name: "Nivea Soft Light Moisturiser 200ml", price: 220, originalPrice: 250, discount: 12, stock: 95, isFeatured: false, category: bySlug['beauty'], brand: "Beiersdorf", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400", description: "Quick-absorbing moisturiser with Jojoba Oil and Vitamin E." },

    // Household
    { name: "Scotch-Brite Scrub Pad (Pack of 3)", price: 65, stock: 200, isFeatured: false, category: bySlug['household'], brand: "3M", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", description: "Tough scrubbing power for dishes, pots and pans." },
    { name: "Good Knight Fast Card (10 cards)", price: 45, stock: 250, isFeatured: false, category: bySlug['household'], brand: "Godrej", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", description: "Instant mosquito repellent cards — effective and easy to use." },

    // Stationery
    { name: "Classmate Pulse Notebook A5 (Pack of 6)", price: 120, originalPrice: 150, discount: 20, stock: 100, isFeatured: false, category: bySlug['stationery'], brand: "ITC", imageUrl: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400", description: "Long-lasting notebooks with smooth 180-page ruling for students." },
  ].map((p) => ({
    ...p,
    slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).slice(2, 7),
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviewCount: Math.floor(Math.random() * 200 + 20),
    images: [],
    tags: [],
  }));
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Cannot seed database.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create admin user (password is hashed by pre-save hook)
  await User.create({
    name: 'Admin',
    email: 'admin@dukaanbazar.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Admin user created: admin@dukaanbazar.com / admin123');

  // Create categories
  const cats = await Category.insertMany(CATEGORIES);
  console.log(`Created ${cats.length} categories`);

  // Create products
  const products = getProducts(cats);
  await Product.insertMany(products);
  console.log(`Created ${products.length} products`);

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
