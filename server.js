import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Secure File Paths
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories and files exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Serve uploaded images and local framer JS scripts static routes
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1d' }));
app.use('/framer-js', express.static(path.join(__dirname, 'framer-js'), { maxAge: '1d', etag: true }));



// --- Multer Image Upload Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `upload_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp, gif) are allowed!'));
  }
});

// --- Admin Authentication ---
const ADMIN_TOKEN = "dreamelevate-admin-secure-token-2026";
const ADMIN_PASS = "admin123";

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Admin access required' });
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: 'Invalid admin password' });
});

// --- JSON DB Read/Write Utilities ---
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${path.basename(filePath)}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${path.basename(filePath)}:`, err);
    return false;
  }
}

// --- CLIENT AUTHENTICATION (Login only - Registration is Admin managed) ---


// 1. Client Login
app.post('/api/users/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and Password are required' });
  }

  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.phone === phone && u.password === password);
  if (userIndex === -1) {
    return res.status(401).json({ error: 'Invalid phone number or password' });
  }

  const user = users[userIndex];
  
  // Ensure legacy users have fields initialized
  let updated = false;
  if (user.loyaltyPoints === undefined) { user.loyaltyPoints = 0; updated = true; }
  if (user.lastLoginDate === undefined) { user.lastLoginDate = ""; updated = true; }
  if (user.loginStreak === undefined) { user.loginStreak = 0; updated = true; }
  if (user.coupons === undefined) { user.coupons = []; updated = true; }
  if (user.loginHistory === undefined) { user.loginHistory = []; updated = true; }

  if (updated) {
    users[userIndex] = user;
    writeJsonFile(USERS_FILE, users);
  }

  const { password: _, ...profile } = user;
  res.json(profile);
});

// 2. Client Self-Registration
app.post('/api/users/register', (req, res) => {
  const { name, phone, password, email, address } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, Phone, and Password are required' });
  }

  const users = readJsonFile(USERS_FILE);
  const exists = users.find(u => u.phone === phone);
  if (exists) {
    return res.status(400).json({ error: 'Phone number is already registered' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    phone,
    email: email || '',
    address: address || '',
    password,
    loyaltyPoints: 0,
    lastLoginDate: '',
    loginStreak: 0,
    coupons: [],
    loginHistory: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE, users);

  const { password: _, ...profile } = newUser;
  res.status(201).json(profile);
});

// 3. Daily Reward Claim
app.post('/api/users/daily-claim', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = users[userIndex];
  
  // Ensure fields are initialized
  if (user.loyaltyPoints === undefined) user.loyaltyPoints = 0;
  if (user.lastLoginDate === undefined) user.lastLoginDate = "";
  if (user.loginStreak === undefined) user.loginStreak = 0;
  if (user.coupons === undefined) user.coupons = [];
  if (user.loginHistory === undefined) user.loginHistory = [];

  // Determine current server date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  if (user.lastLoginDate === today) {
    return res.status(400).json({ error: 'Daily reward already claimed today' });
  }

  // Calculate streak
  let streak = user.loginStreak || 0;
  let pointsEarned = 10; // Default points

  if (user.lastLoginDate) {
    const lastClaimDate = new Date(user.lastLoginDate);
    const currentDate = new Date(today);
    
    // Difference in days
    const diffTime = Math.abs(currentDate - lastClaimDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive login!
      streak += 1;
    } else {
      // Streak broken, reset to 1
      streak = 1;
    }
  } else {
    // First ever claim
    streak = 1;
  }

  // Points based on streak day (1 to 7 cycle)
  const streakDay = ((streak - 1) % 7) + 1;
  if (streakDay === 1 || streakDay === 2) {
    pointsEarned = 10;
  } else if (streakDay === 3 || streakDay === 4) {
    pointsEarned = 15;
  } else if (streakDay === 5 || streakDay === 6) {
    pointsEarned = 20;
  } else if (streakDay === 7) {
    pointsEarned = 50; // Big bonus on day 7!
  }

  user.loyaltyPoints += pointsEarned;
  user.loginStreak = streak;
  user.lastLoginDate = today;
  user.loginHistory.push({
    date: new Date().toISOString(),
    points: pointsEarned,
    streakDay
  });

  users[userIndex] = user;
  writeJsonFile(USERS_FILE, users);

  const { password: _, ...profile } = user;
  res.json({
    success: true,
    pointsEarned,
    streak,
    streakDay,
    profile
  });
});

// 4. Redeem Points for Coupon
app.post('/api/users/redeem-coupon', (req, res) => {
  const { phone, rewardType } = req.body;
  if (!phone || !rewardType) {
    return res.status(400).json({ error: 'Phone and rewardType are required' });
  }

  // Cost map for rewards
  const rewardsMap = {
    'discount_5': { points: 100, value: 5, label: '$5 Off Coupon' },
    'discount_10': { points: 200, value: 10, label: '$10 Off Coupon' },
    'discount_25': { points: 500, value: 25, label: '$25 Off Coupon' }
  };

  const reward = rewardsMap[rewardType];
  if (!reward) {
    return res.status(400).json({ error: 'Invalid reward type' });
  }

  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = users[userIndex];
  if (user.loyaltyPoints === undefined) user.loyaltyPoints = 0;
  if (user.coupons === undefined) user.coupons = [];

  if (user.loyaltyPoints < reward.points) {
    return res.status(400).json({ error: `Insufficient points. Need ${reward.points} points.` });
  }

  // Generate unique coupon code
  const code = `DB-${reward.value}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  user.loyaltyPoints -= reward.points;
  user.coupons.push({
    code,
    value: reward.value,
    label: reward.label,
    claimedAt: new Date().toISOString(),
    used: false
  });

  users[userIndex] = user;
  writeJsonFile(USERS_FILE, users);

  const { password: _, ...profile } = user;
  res.json({
    success: true,
    code,
    coupon: user.coupons[user.coupons.length - 1],
    profile
  });
});

// 5. Validate Coupon Code
app.post('/api/users/validate-coupon', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and Coupon code are required' });
  }

  const users = readJsonFile(USERS_FILE);
  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.coupons) {
    return res.status(400).json({ error: 'No coupons found for this user' });
  }

  const coupon = user.coupons.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }

  if (coupon.used) {
    return res.status(400).json({ error: 'Coupon has already been used' });
  }

  res.json({
    valid: true,
    value: coupon.value,
    label: coupon.label
  });
});

// 6. Mark Coupon as Used
app.post('/api/users/use-coupon', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and Coupon code are required' });
  }

  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = users[userIndex];
  if (!user.coupons) {
    return res.status(400).json({ error: 'No coupons found for this user' });
  }

  const couponIndex = user.coupons.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  if (couponIndex === -1) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }

  if (user.coupons[couponIndex].used) {
    return res.status(400).json({ error: 'Coupon already used' });
  }

  user.coupons[couponIndex].used = true;
  user.coupons[couponIndex].usedAt = new Date().toISOString();

  users[userIndex] = user;
  writeJsonFile(USERS_FILE, users);

  res.json({
    success: true,
    message: 'Coupon marked as used successfully'
  });
});


// --- ADMIN USERS / CUSTOMERS MANAGEMENT APIs ---

// 1. Get all customers
app.get('/api/admin/users', requireAdminAuth, (req, res) => {
  const users = readJsonFile(USERS_FILE);
  res.json(users);
});

// 2. Add customer (Admin managed)
app.post('/api/admin/users', requireAdminAuth, (req, res) => {
  const { name, phone, email, address, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, Phone and Password are required' });
  }

  const users = readJsonFile(USERS_FILE);
  const exists = users.find(u => u.phone === phone);
  if (exists) {
    return res.status(400).json({ error: 'Customer phone number is already registered' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    phone,
    email: email || '',
    address: address || '',
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE, users);
  res.status(201).json(newUser);
});

// 3. Edit customer (Admin managed)
app.put('/api/admin/users/:id', requireAdminAuth, (req, res) => {
  const { name, phone, email, address, password } = req.body;
  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Check if changing phone conflicts with another customer
  if (phone && phone !== users[userIndex].phone) {
    const exists = users.find(u => u.phone === phone);
    if (exists) {
      return res.status(400).json({ error: 'Another customer is already using this phone number' });
    }
  }

  const updatedUser = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    phone: phone || users[userIndex].phone,
    email: email !== undefined ? email : users[userIndex].email,
    address: address !== undefined ? address : users[userIndex].address,
    password: password || users[userIndex].password
  };

  users[userIndex] = updatedUser;
  writeJsonFile(USERS_FILE, users);
  res.json(updatedUser);
});

// 4. Delete customer (Admin managed)
app.delete('/api/admin/users/:id', requireAdminAuth, (req, res) => {
  const users = readJsonFile(USERS_FILE);
  const filtered = users.filter(u => u.id !== req.params.id);

  if (users.length === filtered.length) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  writeJsonFile(USERS_FILE, filtered);
  res.json({ success: true, message: 'Customer deleted successfully' });
});

// --- PRODUCT APIs ---

// 1. Get all products
app.get('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const normalized = products.map((item, idx) => {
    const img = item.image || item.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';
    const priceLabel = item.price_label || (item.price ? `₹${item.price}` : '₹799');
    const numPrice = typeof item.price === 'number' ? item.price : (parseFloat(priceLabel.replace(/[^0-9.]/g, '')) || 799);
    return {
      ...item,
      id: item.id || `prod_${idx}`,
      name: item.name || 'Gourmet Cake',
      price: numPrice,
      price_label: priceLabel,
      image: img,
      image_url: img,
      category: item.category || 'Custom Cakes',
      description: item.description || ''
    };
  });
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.json(normalized);
});

app.get('/api/menu-items', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const normalized = products.map((item, idx) => {
    const img = item.image || item.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';
    const priceLabel = item.price_label || (item.price ? `₹${item.price}` : '₹799');
    const numPrice = typeof item.price === 'number' ? item.price : (parseFloat(priceLabel.replace(/[^0-9.]/g, '')) || 799);
    return {
      ...item,
      id: item.id || `prod_${idx}`,
      name: item.name || 'Gourmet Cake',
      price: numPrice,
      price_label: priceLabel,
      image: img,
      image_url: img,
      category: item.category || 'Custom Cakes',
      description: item.description || ''
    };
  });
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.json(normalized);
});

// 2. Add product (Admin only)
app.post('/api/products', requireAdminAuth, (req, res) => {
  const { name, price, category, description, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Missing required fields (name, price, category)' });
  }

  const products = readJsonFile(PRODUCTS_FILE);
  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    price: parseFloat(price),
    category,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop'
  };

  products.push(newProduct);
  writeJsonFile(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

// 3. Update product (Admin only)
app.put('/api/products/:id', requireAdminAuth, (req, res) => {
  const { name, price, category, description, image } = req.body;
  const products = readJsonFile(PRODUCTS_FILE);
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price ? parseFloat(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    description: description !== undefined ? description : products[productIndex].description,
    image: image || products[productIndex].image
  };

  products[productIndex] = updatedProduct;
  writeJsonFile(PRODUCTS_FILE, products);
  res.json(updatedProduct);
});

// 4. Delete product (Admin only)
app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== req.params.id);

  if (products.length === filtered.length) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeJsonFile(PRODUCTS_FILE, filtered);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// 5. Upload Image Endpoint (Admin only)
app.post('/api/upload', requireAdminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ success: true, imagePath });
});

// --- ORDER APIs ---

// 1. Get all orders (Admin only)
app.get('/api/orders', requireAdminAuth, (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// 2. Client tracking: Get own orders by Phone Number
app.get('/api/orders/my-orders', (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number parameter is required' });
  }

  const orders = readJsonFile(ORDERS_FILE);
  const myOrders = orders.filter(o => o.phone === phone);
  myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

// Helper to auto-register customer profile on ordering if phone is new
function autoRegisterCustomer(customerName, phone, address, email) {
  try {
    const users = readJsonFile(USERS_FILE);
    const exists = users.find(u => u.phone === phone);
    if (!exists) {
      const newUser = {
        id: `user-${Date.now()}`,
        name: customerName,
        phone,
        email: email || '',
        address: address || '',
        password: 'N/A',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJsonFile(USERS_FILE, users);
    }
  } catch (err) {
    console.error('Error auto-registering customer:', err);
  }
}

// 3. Place a catalog order (Cart Checkout)
app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, deliveryDate, items, totalAmount, couponCode, discountApplied } = req.body;
  if (!customerName || !phone || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Missing required fields for order placement' });
  }

  const orders = readJsonFile(ORDERS_FILE);
  const newOrder = {
    id: `order-${Date.now()}`,
    type: 'catalog_order',
    createdAt: new Date().toISOString(),
    status: 'Pending',
    customerName,
    phone,
    address: address || 'Store Pick-up',
    deliveryDate: deliveryDate || 'As soon as possible',
    items,
    totalAmount: parseFloat(totalAmount),
    couponCode: couponCode || '',
    discountApplied: parseFloat(discountApplied) || 0
  };

  orders.push(newOrder);
  writeJsonFile(ORDERS_FILE, orders);
  
  // Auto register customer
  autoRegisterCustomer(customerName, phone, address, '');

  // Award loyalty points to registered customer (1 point per $1 spent)
  const users = readJsonFile(USERS_FILE);
  const userIndex = users.findIndex(u => u.phone === phone);
  if (userIndex !== -1) {
    const pointsAwarded = Math.floor(parseFloat(totalAmount));
    if (pointsAwarded > 0) {
      if (users[userIndex].loyaltyPoints === undefined) users[userIndex].loyaltyPoints = 0;
      users[userIndex].loyaltyPoints += pointsAwarded;
      writeJsonFile(USERS_FILE, users);
    }
  }

  res.status(201).json(newOrder);
});

// 4. Place a custom cake order (with upload support)
app.post('/api/orders/custom-cake', upload.single('referenceImage'), (req, res) => {
  const { 
    customerName, 
    phone, 
    address, 
    deliveryDate, 
    cakeType, 
    flavor, 
    filling, 
    size, 
    layers, 
    messageOnCake, 
    instructions 
  } = req.body;

  if (!customerName || !phone || !cakeType || !flavor || !size) {
    return res.status(400).json({ error: 'Missing required custom cake order details' });
  }

  let referenceImage = '';
  if (req.file) {
    referenceImage = `/uploads/${req.file.filename}`;
  }

  const orders = readJsonFile(ORDERS_FILE);
  const newOrder = {
    id: `custom-${Date.now()}`,
    type: 'custom_cake',
    createdAt: new Date().toISOString(),
    status: 'Pending',
    customerName,
    phone,
    address: address || 'Store Pick-up',
    deliveryDate: deliveryDate || 'As soon as possible',
    cakeType,
    flavor,
    filling: filling || 'Default Cream',
    size,
    layers: layers || '1 Layer',
    messageOnCake: messageOnCake || '',
    instructions: instructions || '',
    referenceImage
  };

  orders.push(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  // Auto register customer
  autoRegisterCustomer(customerName, phone, address, '');

  res.status(201).json(newOrder);
});

// 5. Update order status (Admin only)
app.patch('/api/orders/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status field is required' });
  }

  const orders = readJsonFile(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = status;
  writeJsonFile(ORDERS_FILE, orders);
  res.json(orders[orderIndex]);
});

// 6. Delete an order (Admin only)
app.delete('/api/orders/:id', requireAdminAuth, (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const filtered = orders.filter(o => o.id !== req.params.id);

  if (orders.length === filtered.length) {
    return res.status(404).json({ error: 'Order not found' });
  }

  writeJsonFile(ORDERS_FILE, filtered);
  res.json({ success: true, message: 'Order deleted successfully' });
});

// --- Security Middleware to shield server/config files from static delivery ---
app.use((req, res, next) => {
  const forbiddenFiles = ['/server.js', '/package.json', '/products.json', '/orders.json', '/users.json', '/package-lock.json', '/.git'];
  const lowercasePath = req.path.toLowerCase();
  
  if (forbiddenFiles.some(f => lowercasePath.startsWith(f))) {
    return res.status(403).send('Access Forbidden');
  }
  next();
});

// --- Serve static website files ---
app.use(express.static(path.join(__dirname)));

// Fallback to home page if route not found
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🍰 DREAM ELEVATE API & Static Web Server running locally!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`👉 Admin Panel: http://localhost:${PORT}/admin/`);
  console.log(`========================================================\n`);
});
