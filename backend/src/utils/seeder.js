require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

// Koneksi ke MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/shoehub')
  .then(() => console.log('✅ MongoDB Connected for Seeding'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Bersihkan data lama
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🧹 Data lama dibersihkan');

    // Buat Admin User
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'ShoeHub',
      email: 'admin@shoehub.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    console.log('👨‍💼 Admin User dibuat (Email: admin@shoehub.com, Pass: admin123)');

    // Buat Customer User
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@shoehub.com',
      password: 'customer123',
      role: 'user',
      isVerified: true
    });
    console.log('👤 Customer User dibuat (Email: customer@shoehub.com, Pass: customer123)');

    // Buat Dummy Products
    const products = [
      {
        name: 'Nike Air Max 270',
        description: 'Men\'s legendary shoe with biggest Max Air unit.',
        category: 'men',
        brand: 'Nike',
        price: 150,
        sku: 'NK-AM270-M',
        sizes: [
          { size: '40', stock: 10 },
          { size: '41', stock: 15 },
          { size: '42', stock: 5 }
        ],
        colors: ['Black', 'White'],
        images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000', altText: 'Nike Air Max 270' }],
        isActive: true,
        featured: true
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Responsive running shoes made in part with Parley Ocean Plastic.',
        category: 'women',
        brand: 'Adidas',
        price: 190,
        sku: 'AD-UB22-W',
        sizes: [
          { size: '37', stock: 8 },
          { size: '38', stock: 12 },
          { size: '39', stock: 10 }
        ],
        colors: ['Pink', 'White'],
        images: [{ url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1000', altText: 'Adidas Ultraboost' }],
        isActive: true,
        featured: true
      }
    ];

    await Product.insertMany(products);
    console.log('👟 Dummy Products dibuat');

    console.log('✨ Seeding Selesai!');
    process.exit();
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

seedData();
