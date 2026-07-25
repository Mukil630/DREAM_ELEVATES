// --- STATE VARIABLES ---
let products = [];
let orders = [];
let users = [];
let activeCategory = 'All';
let activeOrderFilterStatus = 'All';
let adminToken = sessionStorage.getItem('dreamelevates_admin_token');
let currentTab = 'catalog'; // 'catalog' | 'orders' | 'users'

const API_BASE = "http://localhost:3000";

// --- DOM ELEMENTS ---
const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const adminPasswordInput = document.getElementById('admin-password');

const adminPanel = document.getElementById('admin-panel');
const logoutBtn = document.getElementById('logout-btn');

// Metrics
const totalCountEl = document.getElementById('metric-total-count');
const pendingOrdersEl = document.getElementById('metric-pending-orders');
const totalCustomersEl = document.getElementById('metric-total-customers');
const ordersBadge = document.getElementById('orders-badge');

// Tabs Navigation
const tabBtnCatalog = document.getElementById('tab-btn-catalog');
const tabBtnOrders = document.getElementById('tab-btn-orders');
const tabBtnUsers = document.getElementById('tab-btn-users');

const tabContentCatalog = document.getElementById('tab-content-catalog');
const tabContentOrders = document.getElementById('tab-content-orders');
const tabContentUsers = document.getElementById('tab-content-users');

// Catalog Management
const addProductBtn = document.getElementById('add-product-btn');
const productsListEl = document.getElementById('products-list');
const noProductsMsg = document.getElementById('no-products-msg');
const filterTabs = document.querySelectorAll('.filter-tab');

// Orders Management
const ordersListEl = document.getElementById('orders-list');
const noOrdersMsg = document.getElementById('no-orders-msg');
const orderFilterStatusSelect = document.getElementById('order-filter-status');

// Users / Customers Management
const addUserBtn = document.getElementById('add-user-btn');
const usersListEl = document.getElementById('users-list');
const noUsersMsg = document.getElementById('no-users-msg');

// Modals
const productModal = document.getElementById('product-modal');
const productModalTitle = document.getElementById('modal-title');
const productModalClose = document.getElementById('product-modal-close');
const productModalCancel = document.getElementById('product-modal-cancel');
const productForm = document.getElementById('product-form');

const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productCategoryInput = document.getElementById('product-category');
const productDescInput = document.getElementById('product-desc');
const productImageInput = document.getElementById('product-image-url');
const imageFileInput = document.getElementById('image-file');
const imagePreviewBox = document.getElementById('image-preview');

// User Modal
const userModal = document.getElementById('user-modal');
const userModalTitle = document.getElementById('user-modal-title');
const userModalClose = document.getElementById('user-modal-close');
const userModalCancel = document.getElementById('user-modal-cancel');
const userForm = document.getElementById('user-form');

const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');
const userPhoneInput = document.getElementById('user-phone');
const userPasswordInput = document.getElementById('user-password');
const userEmailInput = document.getElementById('user-email');
const userAddressInput = document.getElementById('user-address');

const toast = document.getElementById('toast');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    showDashboard();
  } else {
    showLogin();
  }
  setupTabs();
  setupModals();
});

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
  toast.innerText = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// --- SWITCH PANELS ---
function showLogin() {
  loginContainer.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  adminPasswordInput.value = '';
}

function showDashboard() {
  loginContainer.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  
  // Sync all data
  fetchProducts();
  fetchOrders();
  fetchUsers();
}

// --- TABS CONTROL ---
function setupTabs() {
  tabBtnCatalog.addEventListener('click', () => switchTab('catalog'));
  tabBtnOrders.addEventListener('click', () => switchTab('orders'));
  tabBtnUsers.addEventListener('click', () => switchTab('users'));
}

function switchTab(tabName) {
  currentTab = tabName;
  
  // Toggle active button
  tabBtnCatalog.classList.toggle('active', tabName === 'catalog');
  tabBtnOrders.classList.toggle('active', tabName === 'orders');
  tabBtnUsers.classList.toggle('active', tabName === 'users');

  // Toggle visible sections
  tabContentCatalog.classList.toggle('hidden', tabName !== 'catalog');
  tabContentOrders.classList.toggle('hidden', tabName !== 'orders');
  tabContentUsers.classList.toggle('hidden', tabName !== 'users');

  if (tabName === 'catalog') fetchProducts();
  if (tabName === 'orders') fetchOrders();
  if (tabName === 'users') fetchUsers();
}

// --- LOGIN HANDLER ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = adminPasswordInput.value;

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      adminToken = data.token;
      sessionStorage.setItem('dreamelevates_admin_token', adminToken);
      showToast('Authenticated successfully!');
      showDashboard();
    } else {
      showToast(data.error || 'Authentication failed', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
    console.error(err);
  }
});

// --- LOGOUT HANDLER ---
logoutBtn.addEventListener('click', () => {
  adminToken = null;
  sessionStorage.removeItem('dreamelevates_admin_token');
  showToast('Logged out');
  showLogin();
});

// --- FETCH PRODUCTS & RENDER ---
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (res.ok) {
      products = await res.json();
      updateMetrics();
      renderProductsTable();
    } else {
      showToast('Failed to fetch menu items', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to API server', 'error');
    console.error(err);
  }
}

function updateMetrics() {
  totalCountEl.innerText = products.length;
  
  const pending = orders.filter(o => o.status === 'Pending').length;
  pendingOrdersEl.innerText = pending;

  totalCustomersEl.innerText = users.length;

  if (pending > 0) {
    ordersBadge.innerText = pending;
    ordersBadge.classList.remove('hidden');
  } else {
    ordersBadge.classList.add('hidden');
  }
}

function renderProductsTable() {
  productsListEl.innerHTML = '';
  
  const filtered = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  if (filtered.length === 0) {
    noProductsMsg.classList.remove('hidden');
    return;
  }
  
  noProductsMsg.classList.add('hidden');

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    const imgSrc = p.image.startsWith('/uploads') ? `${API_BASE}${p.image}` : p.image;
    
    tr.innerHTML = `
      <td><img src="${imgSrc}" class="table-img" alt="${p.name}"></td>
      <td><div class="table-title">${escapeHtml(p.name)}</div></td>
      <td><span class="table-category">${escapeHtml(p.category)}</span></td>
      <td><span class="table-price">$${p.price.toFixed(2)}</span></td>
      <td><div class="table-desc" title="${escapeHtml(p.description)}">${escapeHtml(p.description || '-')}</div></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm edit-product-btn" data-id="${p.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-product-btn" data-id="${p.id}">Delete</button>
        </div>
      </td>
    `;
    productsListEl.appendChild(tr);
  });

  // Bind edit and delete click handlers
  document.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openEditProductModal(id);
    });
  });

  document.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      handleDeleteProduct(id);
    });
  });
}

// --- FETCH ORDERS & RENDER ---
async function fetchOrders() {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      orders = await res.json();
      updateMetrics();
      renderOrdersTable();
    } else {
      showToast('Failed to fetch orders data', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to orders API', 'error');
    console.error(err);
  }
}

function renderOrdersTable() {
  ordersListEl.innerHTML = '';
  
  const filtered = activeOrderFilterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === activeOrderFilterStatus.toLowerCase());

  if (filtered.length === 0) {
    noOrdersMsg.classList.remove('hidden');
    return;
  }
  
  noOrdersMsg.classList.add('hidden');

  filtered.forEach(o => {
    const tr = document.createElement('tr');
    
    // Check type & details
    let typeBadge = '';
    let detailsHtml = '';
    
    if (o.type === 'custom_cake') {
      typeBadge = `<span class="order-type-tag custom">🎂 Custom Cake</span>`;
      const refImgUrl = o.referenceImage ? `${API_BASE}${o.referenceImage}` : '';
      
      detailsHtml = `
        <div class="cake-specs">
          <div class="cake-spec-header">${escapeHtml(o.cakeType)} Cake Request</div>
          <div class="cake-spec-item"><span>Flavor:</span> ${escapeHtml(o.flavor)}</div>
          <div class="cake-spec-item"><span>Filling:</span> ${escapeHtml(o.filling)}</div>
          <div class="cake-spec-item"><span>Size:</span> ${escapeHtml(o.size)}</div>
          <div class="cake-spec-item"><span>Tiers:</span> ${escapeHtml(o.layers)}</div>
          ${o.messageOnCake ? `<div class="cake-message">Message: "${escapeHtml(o.messageOnCake)}"</div>` : ''}
          ${o.instructions ? `<div class="cake-spec-item" style="margin-top:4px;"><span>Instructions:</span> <span style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(o.instructions)}</span></div>` : ''}
          ${o.referenceImage ? `<a href="${refImgUrl}" target="_blank" class="ref-img-link">🖼️ View Reference Image</a>` : ''}
        </div>
      `;
    } else {
      typeBadge = `<span class="order-type-tag catalog">📦 Catalog Order</span>`;
      
      let itemsListHtml = '';
      o.items.forEach(item => {
        itemsListHtml += `
          <div class="order-item-row">
            <span class="order-item-qty">${item.quantity}x</span> ${escapeHtml(item.name)} 
            <span style="font-size:0.85rem;color:var(--text-muted);">($${item.price.toFixed(2)})</span>
          </div>
        `;
      });
      
      detailsHtml = `
        <div class="order-details-display">
          ${itemsListHtml}
          <div class="order-total-price">Total Amount: $${o.totalAmount.toFixed(2)}</div>
        </div>
      `;
    }

    const cleanDate = new Date(o.createdAt).toLocaleString();
    const statusClass = `status-${o.status.toLowerCase().replace(' ', '')}`;

    tr.innerHTML = `
      <td>
        <strong style="font-size:0.85rem;color:var(--primary);">${o.id}</strong><br>
        <span style="font-size:0.75rem;color:var(--text-muted);">${cleanDate}</span>
      </td>
      <td>
        <div class="order-customer-info">
          <span class="customer-name">${escapeHtml(o.customerName)}</span>
          <a href="tel:${o.phone}" class="customer-phone">📞 ${escapeHtml(o.phone)}</a>
          <span class="customer-address">📍 ${escapeHtml(o.address)}</span>
        </div>
      </td>
      <td>${typeBadge}</td>
      <td>${detailsHtml}</td>
      <td><span style="font-weight:700;font-size:0.9rem;color:#432405;">${escapeHtml(o.deliveryDate)}</span></td>
      <td>
        <div class="status-select-wrapper">
          <select class="status-select ${statusClass}" data-id="${o.id}">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${o.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Ready" ${o.status === 'Ready' ? 'selected' : ''}>Ready</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-danger btn-sm delete-order-btn" data-id="${o.id}">Delete</button>
        </div>
      </td>
    `;
    ordersListEl.appendChild(tr);
  });

  // Bind Order Status Shifts
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      
      // Update styling class immediately
      e.target.className = `status-select status-${newStatus.toLowerCase().replace(' ', '')}`;
      
      await handleUpdateOrderStatus(orderId, newStatus);
    });
  });

  // Bind Order Deletion
  document.querySelectorAll('.delete-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      handleDeleteOrder(id);
    });
  });
}

// --- FETCH CUSTOMERS & RENDER ---
async function fetchUsers() {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      users = await res.json();
      updateMetrics();
      renderUsersTable();
    } else {
      showToast('Failed to fetch customers list', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to customers API', 'error');
    console.error(err);
  }
}

function renderUsersTable() {
  usersListEl.innerHTML = '';

  if (users.length === 0) {
    noUsersMsg.classList.remove('hidden');
    return;
  }
  
  noUsersMsg.classList.add('hidden');

  users.forEach(u => {
    const tr = document.createElement('tr');
    const cleanPhone = u.phone.replace(/[^0-9]/g, '');
    const waLink = cleanPhone.length === 10 ? `https://wa.me/91${cleanPhone}` : `https://wa.me/${cleanPhone}`;
    
    tr.innerHTML = `
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td><a href="tel:${u.phone}" style="color:var(--primary); font-weight:700;">📞 ${escapeHtml(u.phone)}</a></td>
      <td>${escapeHtml(u.email || '-')}</td>
      <td><div style="font-size:0.9rem; max-width:250px; white-space:normal;">${escapeHtml(u.address || '-')}</div></td>
      <td>
        <div class="table-actions">
          <a href="${waLink}" target="_blank" class="btn btn-success btn-sm" style="background:#25d366; color:white; border:none; text-decoration:none; display:inline-flex; align-items:center; gap:4px; padding: 5px 10px; border-radius: 4px; font-size:0.8rem; font-weight:700; cursor:pointer;">💬 WhatsApp</a>
          <button class="btn btn-secondary btn-sm edit-user-btn" data-id="${u.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-user-btn" data-id="${u.id}">Delete</button>
        </div>
      </td>
    `;
    usersListEl.appendChild(tr);
  });

  // Bind customer actions
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openEditUserModal(id);
    });
  });

  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      handleDeleteUser(id);
    });
  });
}

// --- UPDATE ORDER STATUS API ---
async function handleUpdateOrderStatus(orderId, status) {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    
    if (res.ok) {
      showToast('Order status updated!');
      fetchOrders();
    } else {
      showToast('Failed to update status', 'error');
    }
  } catch (err) {
    showToast('Failed to send status update', 'error');
    console.error(err);
  }
}

// --- DELETE ORDER API ---
async function handleDeleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  if (!adminToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Order records deleted');
      fetchOrders();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Failed to send delete request', 'error');
    console.error(err);
  }
}

// --- DELETE PRODUCT API ---
async function handleDeleteProduct(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  if (!adminToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Menu item deleted');
      fetchProducts();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Failed to send delete request', 'error');
    console.error(err);
  }
}

// --- DELETE CUSTOMER ACCOUNT API ---
async function handleDeleteUser(id) {
  if (!confirm('Are you sure you want to delete this customer account?')) return;
  if (!adminToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Customer account deleted');
      fetchUsers();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Failed to delete customer', 'error');
    console.error(err);
  }
}

// --- ORDER STATUS FILTER TAB ---
orderFilterStatusSelect.addEventListener('change', (e) => {
  activeOrderFilterStatus = e.target.value;
  renderOrdersTable();
});

// --- CATALOG FILTER TAB ---
filterTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    filterTabs.forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    activeCategory = e.target.getAttribute('data-category');
    renderProductsTable();
  });
});

// --- IMAGE PREVIEW HANDLING ---
productImageInput.addEventListener('input', () => {
  updateImagePreview(productImageInput.value);
});

imageFileInput.addEventListener('change', () => {
  const file = imageFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

function updateImagePreview(src) {
  if (src) {
    imagePreviewBox.innerHTML = `<img src="${src}" alt="Preview">`;
  } else {
    imagePreviewBox.innerHTML = `<span class="placeholder-text">No Image Selected</span>`;
  }
}

// --- MODALS setup ---
function setupModals() {
  // Product Modal Cancel buttons
  productModalClose.addEventListener('click', closeProductModal);
  productModalCancel.addEventListener('click', closeProductModal);
  
  // User Modal Cancel buttons
  userModalClose.addEventListener('click', closeUserModal);
  userModalCancel.addEventListener('click', closeUserModal);
  
  // Click outside overlays
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });
  userModal.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
  });
}

function openAddProductModal() {
  productForm.reset();
  productIdInput.value = '';
  updateImagePreview('');
  productModalTitle.innerText = 'Add Menu Item';
  productModal.classList.remove('hidden');
}

function openEditProductModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  productIdInput.value = product.id;
  productNameInput.value = product.name;
  productPriceInput.value = product.price;
  productCategoryInput.value = product.category;
  productDescInput.value = product.description;
  productImageInput.value = product.image.startsWith('/uploads') ? '' : product.image;
  imageFileInput.value = ''; // Reset file input

  updateImagePreview(product.image.startsWith('/uploads') ? `${API_BASE}${product.image}` : product.image);
  productModalTitle.innerText = 'Edit Menu Item';
  productModal.classList.remove('hidden');
}

function closeProductModal() {
  productModal.classList.add('hidden');
  productForm.reset();
  productIdInput.value = '';
}

function openAddUserModal() {
  userForm.reset();
  userIdInput.value = '';
  userModalTitle.innerText = 'Add Customer Account';
  userModal.classList.remove('hidden');
}

function openEditUserModal(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;

  userIdInput.value = user.id;
  userNameInput.value = user.name;
  userPhoneInput.value = user.phone;
  userPasswordInput.value = user.password;
  userEmailInput.value = user.email || '';
  userAddressInput.value = user.address || '';

  userModalTitle.innerText = 'Edit Customer Details';
  userModal.classList.remove('hidden');
}

function closeUserModal() {
  userModal.classList.add('hidden');
  userForm.reset();
  userIdInput.value = '';
}

addProductBtn.addEventListener('click', openAddProductModal);
addUserBtn.addEventListener('click', openAddUserModal);

// --- SAVE PRODUCT FORM ---
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = productIdInput.value;
  const name = productNameInput.value;
  const price = parseFloat(productPriceInput.value);
  const category = productCategoryInput.value;
  const description = productDescInput.value;
  let image = productImageInput.value;

  const localFile = imageFileInput.files[0];
  if (localFile) {
    try {
      showToast('Uploading image...', 'info');
      const formData = new FormData();
      formData.append('image', localFile);

      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (uploadRes.ok && uploadData.success) {
        image = uploadData.imagePath;
      } else {
        showToast(uploadData.error || 'Image upload failed', 'error');
        return;
      }
    } catch (err) {
      showToast('Image upload failed due to network error', 'error');
      console.error(err);
      return;
    }
  }

  if (!image) {
    image = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop';
  }

  const payload = { name, price, category, description, image };
  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      showToast(isEdit ? 'Menu item updated!' : 'Menu item added!');
      closeProductModal();
      fetchProducts();
    } else {
      showToast(data.error || 'Failed to save product', 'error');
    }
  } catch (err) {
    showToast('Error communicating with server', 'error');
    console.error(err);
  }
});

// --- SAVE CUSTOMER FORM ---
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = userIdInput.value;
  const name = userNameInput.value.trim();
  const phone = userPhoneInput.value.trim();
  const password = userPasswordInput.value;
  const email = userEmailInput.value.trim();
  const address = userAddressInput.value.trim();

  const payload = { name, phone, password, email, address };
  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/api/admin/users/${id}` : `${API_BASE}/api/admin/users`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      showToast(isEdit ? 'Customer profile updated!' : 'Customer registered successfully!');
      closeUserModal();
      fetchUsers();
    } else {
      showToast(data.error || 'Failed to save customer', 'error');
    }
  } catch (err) {
    showToast('Error communicating with customer API', 'error');
    console.error(err);
  }
});

// --- HELPER ESCAPE HTML ---
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
