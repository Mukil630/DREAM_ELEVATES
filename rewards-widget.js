/* --- LOYALTY REWARDS WIDGET JAVASCRIPT --- */

(function () {
  // Config
  const API_BASE = window.location.origin; // Dynamically use host (e.g. http://localhost:3000)
  
  // State
  let currentUser = JSON.parse(localStorage.getItem('dreambakes_user')) || null;
  let activeTab = 'login'; // 'login' | 'register'
  
  // Load stylesheet dynamically
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = '/rewards-widget.css';
  document.head.appendChild(cssLink);
  
  // Inject HTML Markup
  document.addEventListener('DOMContentLoaded', () => {
    // Inject floating button, drawer overlays, and confetti canvas
    const htmlMarkup = `
      <!-- Floating Widget Trigger -->
      <button id="rewards-float-btn" class="rewards-float-btn">
        <span class="gift-icon">🎁</span>
        <span class="float-btn-text">Daily Rewards</span>
      </button>
      
      <!-- Drawer HTML -->
      <div id="rewards-drawer-overlay" class="rewards-drawer-overlay"></div>
      <div id="rewards-drawer" class="rewards-drawer">
        <div class="rewards-drawer-header">
          <h2 id="rewards-drawer-title">🍰 Bakes Club</h2>
          <span id="rewards-drawer-close" class="rewards-drawer-close">&times;</span>
        </div>
        
        <!-- Inside drawer toast for fast updates -->
        <div id="rewards-drawer-toast" class="rewards-drawer-toast hidden"></div>
        
        <!-- Scrollable drawer content -->
        <div id="rewards-drawer-content" class="rewards-drawer-content">
          <!-- Dynamically loaded forms/dashboard -->
        </div>
      </div>
      
      <!-- Confetti Canvas -->
      <canvas id="rewards-confetti"></canvas>
    `;
    
    document.body.insertAdjacentHTML('beforeend', htmlMarkup);
    
    // Attempt header integration
    integrateHeaderLink();
    
    // Bind Event Listeners
    const floatBtn = document.getElementById('rewards-float-btn');
    const overlay = document.getElementById('rewards-drawer-overlay');
    const drawer = document.getElementById('rewards-drawer');
    const closeBtn = document.getElementById('rewards-drawer-close');
    
    floatBtn.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    
    // Initial Render
    renderDrawerContent();
  });
  
  // Try to append a Loyalty Rewards link to the header navbar
  function integrateHeaderLink() {
    // Class names from Kafe Milano Framer Template header
    const navActions = document.querySelector('.framer-1j8q8ew') || document.querySelector('.framer-1l7hkqs');
    if (navActions) {
      const headerRewardBtn = document.createElement('div');
      headerRewardBtn.className = 'header-rewards-nav-item';
      headerRewardBtn.style.marginRight = '12px';
      headerRewardBtn.style.display = 'inline-block';
      headerRewardBtn.style.cursor = 'pointer';
      
      headerRewardBtn.innerHTML = `
        <a class="framer-it8bqu framer-2sarfb" style="text-decoration:none;">
          <div class="framer-1xpgdxv" style="padding: 10px 16px; background: rgba(227, 140, 54, 0.1); border-radius: 8px; border: 1px solid rgba(227, 140, 54, 0.2);">
            <p style="margin:0; font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.85rem; color:#e38c36;">
              🎁 Rewards ${currentUser ? `(${currentUser.loyaltyPoints}p)` : ''}
            </p>
          </div>
        </a>
      `;
      
      headerRewardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
      
      // Insert as first action
      navActions.insertBefore(headerRewardBtn, navActions.firstChild);
    }
  }
  
  // Re-sync header points count
  function syncHeaderLink() {
    const p = document.querySelector('.header-rewards-nav-item p');
    if (p) {
      p.innerText = currentUser 
        ? `🎁 Rewards (${currentUser.loyaltyPoints}p)` 
        : `🎁 Rewards`;
    }
  }
  
  // Handle Drawer open/close
  function openDrawer() {
    document.getElementById('rewards-drawer-overlay').classList.add('active');
    document.getElementById('rewards-drawer').classList.add('active');
    // Fetch fresh user data if logged in to get updated streak/points
    if (currentUser) {
      refreshUserData();
    } else {
      renderDrawerContent();
    }
  }
  
  function closeDrawer() {
    document.getElementById('rewards-drawer-overlay').classList.remove('active');
    document.getElementById('rewards-drawer').classList.remove('active');
  }
  
  // Toast notifications for the drawer
  function showDrawerToast(message, type = 'success') {
    const toast = document.getElementById('rewards-drawer-toast');
    toast.innerText = message;
    toast.className = `rewards-drawer-toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
  
  // Dynamic User Sync
  async function refreshUserData() {
    if (!currentUser) return;
    try {
      // Re-login with credentials or verify profile
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentUser.phone, password: currentUser.password })
      });
      if (res.ok) {
        const freshData = await res.json();
        currentUser = freshData;
        localStorage.setItem('dreambakes_user', JSON.stringify(freshData));
        
        // Custom event for order auto-fill page compatibility
        window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: freshData }));
        syncHeaderLink();
      }
    } catch (e) {
      console.warn("Failed to refresh user points", e);
    }
    renderDrawerContent();
  }
  
  // Draw Content Based on Auth State
  function renderDrawerContent() {
    const contentBox = document.getElementById('rewards-drawer-content');
    if (!contentBox) return;
    
    if (currentUser) {
      renderDashboard(contentBox);
    } else {
      if (activeTab === 'login') {
        renderLoginForm(contentBox);
      } else {
        renderRegisterForm(contentBox);
      }
    }
  }
  
  // Render LoginForm
  function renderLoginForm(container) {
    container.innerHTML = `
      <div style="padding-top: 10px;">
        <p style="margin-bottom: 24px; font-size: 0.9rem; line-height: 1.5;">
          Join the <strong>Bakes Club</strong> to claim daily points, unlock exclusive custom discount coupons, and track your baking orders!
        </p>
        
        <form id="rewards-login-form">
          <div class="rewards-form-group">
            <label for="rewards-login-phone">Phone Number</label>
            <input type="text" id="rewards-login-phone" class="rewards-input" placeholder="e.g. 9876543210" required>
          </div>
          
          <div class="rewards-form-group">
            <label for="rewards-login-pass">Password</label>
            <input type="password" id="rewards-login-pass" class="rewards-input" placeholder="Enter password" required>
          </div>
          
          <button type="submit" class="rewards-btn">Log In</button>
        </form>
        
        <div class="rewards-switch-link">
          Don't have an account? <a href="#" id="rewards-switch-to-register">Create Account</a>
        </div>
      </div>
    `;
    
    // Bind Form Events
    document.getElementById('rewards-switch-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      activeTab = 'register';
      renderDrawerContent();
    });
    
    document.getElementById('rewards-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('rewards-login-phone').value.trim();
      const password = document.getElementById('rewards-login-pass').value;
      
      const submitBtn = e.target.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Logging In...';
      
      try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          currentUser = data;
          localStorage.setItem('dreambakes_user', JSON.stringify(data));
          showDrawerToast('Welcome back to Bakes Club!');
          window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: data }));
          syncHeaderLink();
          renderDrawerContent();
        } else {
          showDrawerToast(data.error || 'Invalid credentials', 'error');
        }
      } catch (err) {
        showDrawerToast('Server connection error', 'error');
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Log In';
      }
    });
  }
  
  // Render RegisterForm
  function renderRegisterForm(container) {
    container.innerHTML = `
      <div style="padding-top: 5px;">
        <p style="margin-bottom: 20px; font-size: 0.85rem; line-height: 1.4;">
          Create a free account to unlock daily logins, claim reward points, and checkout faster.
        </p>
        
        <form id="rewards-register-form">
          <div class="rewards-form-group">
            <label for="rewards-reg-name">Full Name</label>
            <input type="text" id="rewards-reg-name" class="rewards-input" placeholder="e.g. John Doe" required>
          </div>
          
          <div class="rewards-form-group">
            <label for="rewards-reg-phone">Phone Number</label>
            <input type="text" id="rewards-reg-phone" class="rewards-input" placeholder="e.g. 9876543210" required>
          </div>
          
          <div class="rewards-form-group">
            <label for="rewards-reg-pass">Password</label>
            <input type="password" id="rewards-reg-pass" class="rewards-input" placeholder="Create password" required>
          </div>
          
          <div class="rewards-form-group">
            <label for="rewards-reg-email">Email (Optional)</label>
            <input type="email" id="rewards-reg-email" class="rewards-input" placeholder="e.g. john@example.com">
          </div>
          
          <div class="rewards-form-group">
            <label for="rewards-reg-address">Delivery Address (Optional)</label>
            <input type="text" id="rewards-reg-address" class="rewards-input" placeholder="e.g. 123 Baker St, Suite 4B">
          </div>
          
          <button type="submit" class="rewards-btn">Create Account</button>
        </form>
        
        <div class="rewards-switch-link">
          Already have an account? <a href="#" id="rewards-switch-to-login">Log In</a>
        </div>
      </div>
    `;
    
    // Bind Form Events
    document.getElementById('rewards-switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      activeTab = 'login';
      renderDrawerContent();
    });
    
    document.getElementById('rewards-register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rewards-reg-name').value.trim();
      const phone = document.getElementById('rewards-reg-phone').value.trim();
      const password = document.getElementById('rewards-reg-pass').value;
      const email = document.getElementById('rewards-reg-email').value.trim();
      const address = document.getElementById('rewards-reg-address').value.trim();
      
      const submitBtn = e.target.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating Account...';
      
      try {
        const res = await fetch(`${API_BASE}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, password, email, address })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          currentUser = data;
          localStorage.setItem('dreambakes_user', JSON.stringify(data));
          showDrawerToast('Account created! Welcome to Bakes Club!');
          window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: data }));
          syncHeaderLink();
          renderDrawerContent();
        } else {
          showDrawerToast(data.error || 'Failed to register', 'error');
        }
      } catch (err) {
        showDrawerToast('Server connection error', 'error');
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Create Account';
      }
    });
  }
  
  // Render Dashboard
  function renderDashboard(container) {
    // Check if claimed today
    const todayStr = new Date().toISOString().split('T')[0];
    const isClaimedToday = currentUser.lastLoginDate === todayStr;
    
    // Build Streak Day visual data
    const streak = currentUser.loginStreak || 0;
    const currentStreakDay = ((streak - 1) % 7) + 1; // 1-indexed, 1 to 7
    
    // Construct Day-by-Day Streak Grid markup
    let streakGridHtml = '';
    const pointsRewards = [10, 10, 15, 15, 20, 25, 50];
    
    for (let day = 1; day <= 7; day++) {
      let statusClass = '';
      let isToday = false;
      
      // Determine day status
      if (day < currentStreakDay) {
        statusClass = 'claimed'; // Already claimed in the past
      } else if (day === currentStreakDay) {
        if (isClaimedToday) {
          statusClass = 'claimed'; // Claimed today
        } else {
          statusClass = 'current'; // Today's slot (needs action)
          isToday = true;
        }
      } else {
        statusClass = ''; // Locked / Next days
      }
      
      // Day 7 is double sized in columns
      const isDay7 = day === 7;
      
      streakGridHtml += `
        <div class="rewards-streak-day ${statusClass} ${isDay7 ? 'double' : ''}">
          <div class="day-num">Day ${day}</div>
          <div class="points-val">+${pointsRewards[day-1]}p</div>
        </div>
      `;
    }
    
    // Generate 30-Day Contribution Grid (GitHub-style contributions grid)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      last30Days.push(dateStr);
    }
    
    let contributionCellsHtml = '';
    const history = currentUser.loginHistory || [];
    
    last30Days.forEach(date => {
      const record = history.find(h => h.date && h.date.startsWith(date));
      let levelClass = '';
      let titleText = `${formatFriendlyDate(date)}: No claim`;
      
      if (record) {
        const pts = record.points || 10;
        titleText = `${formatFriendlyDate(date)}: Claimed +${pts}p`;
        if (pts === 50) {
          levelClass = 'claimed-50';
        } else if (pts >= 20) {
          levelClass = 'claimed-20';
        } else if (pts >= 15) {
          levelClass = 'claimed-15';
        } else {
          levelClass = 'claimed-10';
        }
      }
      
      contributionCellsHtml += `
        <div class="rewards-contribution-cell ${levelClass}" title="${titleText}"></div>
      `;
    });

    // Filter out used coupons vs active ones
    const activeCoupons = (currentUser.coupons || []).filter(c => !c.used);
    
    // Calculate progress bars for redeemable items
    const progress5 = Math.min((currentUser.loyaltyPoints / 100) * 100, 100);
    const progress10 = Math.min((currentUser.loyaltyPoints / 200) * 100, 100);
    const progress25 = Math.min((currentUser.loyaltyPoints / 500) * 100, 100);
    
    container.innerHTML = `
      <div style="padding-top: 5px;">
        <!-- Profile summary card -->
        <div class="rewards-profile-card">
          <div class="rewards-profile-name">Hello, ${currentUser.name}!</div>
          <div class="rewards-profile-phone">${currentUser.phone}</div>
          
          <div class="rewards-points-circle">
            <span class="rewards-points-value">${currentUser.loyaltyPoints}</span>
            <span class="rewards-points-label">Points</span>
          </div>
        </div>
        
        <!-- Daily Login Streak Section -->
        <div class="rewards-section-title">Daily Streak Rewards</div>
        <p style="font-size:0.8rem; line-height:1.4; margin-top:-6px; margin-bottom:14px;">
          Log in daily to stack your streak! Day 7 grants a massive <strong>50 points bonus</strong>!
        </p>
        
        <div class="rewards-streak-grid">
          ${streakGridHtml}
        </div>
        
        <button id="rewards-claim-btn" class="rewards-btn" style="background:#e38c36; margin-bottom: 20px;" ${isClaimedToday ? 'disabled' : ''}>
          ${isClaimedToday ? '✓ Already Claimed Today' : 'Claim Daily Reward'}
        </button>

        <!-- 30-Day Contributions Calendar -->
        <div class="rewards-section-title">30-Day Activity Map</div>
        <div class="rewards-contribution-container" style="background:rgba(239, 231, 210, 0.2); border: 1px solid rgba(227, 140, 54, 0.15); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
          <div class="rewards-contribution-grid" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; margin-top: 5px;">
            ${contributionCellsHtml}
          </div>
          <div class="rewards-contribution-legend" style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; font-size: 0.7rem; margin-top: 10px; color: #807060;">
            <span>Less</span>
            <div class="rewards-legend-box" style="width: 8px; height: 8px; border-radius: 1.5px; background:#ebe4d3;"></div>
            <div class="rewards-legend-box" style="width: 8px; height: 8px; border-radius: 1.5px; background:#a3ccb5;"></div>
            <div class="rewards-legend-box" style="width: 8px; height: 8px; border-radius: 1.5px; background:#75b391;"></div>
            <div class="rewards-legend-box" style="width: 8px; height: 8px; border-radius: 1.5px; background:#4a9070;"></div>
            <div class="rewards-legend-box" style="width: 8px; height: 8px; border-radius: 1.5px; background:#e38c36;"></div>
            <span>More</span>
          </div>
        </div>
        
        <!-- Redeem Section -->
        <div class="rewards-section-title">Redeem Baking Coupons</div>
        <div class="rewards-redeem-list">
          <!-- $5 Reward -->
          <div class="rewards-redeem-item">
            <div class="rewards-redeem-info">
              <div class="rewards-redeem-title">$5 Off Bakery Coupon</div>
              <div class="rewards-redeem-cost">100 loyalty points</div>
              <div class="rewards-progress-bg">
                <div class="rewards-progress-bar" style="width: ${progress5}%;"></div>
              </div>
            </div>
            <button class="rewards-redeem-btn" data-reward="discount_5" ${currentUser.loyaltyPoints < 100 ? 'disabled' : ''}>Redeem</button>
          </div>
          
          <!-- $10 Reward -->
          <div class="rewards-redeem-item">
            <div class="rewards-redeem-info">
              <div class="rewards-redeem-title">$10 Off Bakery Coupon</div>
              <div class="rewards-redeem-cost">200 loyalty points</div>
              <div class="rewards-progress-bg">
                <div class="rewards-progress-bar" style="width: ${progress10}%;"></div>
              </div>
            </div>
            <button class="rewards-redeem-btn" data-reward="discount_10" ${currentUser.loyaltyPoints < 200 ? 'disabled' : ''}>Redeem</button>
          </div>
          
          <!-- $25 Reward -->
          <div class="rewards-redeem-item">
            <div class="rewards-redeem-info">
              <div class="rewards-redeem-title">$25 Off Bakery Coupon</div>
              <div class="rewards-redeem-cost">500 loyalty points</div>
              <div class="rewards-progress-bg">
                <div class="rewards-progress-bar" style="width: ${progress25}%;"></div>
              </div>
            </div>
            <button class="rewards-redeem-btn" data-reward="discount_25" ${currentUser.loyaltyPoints < 500 ? 'disabled' : ''}>Redeem</button>
          </div>
        </div>
        
        <!-- Active Coupons List -->
        <div class="rewards-section-title">My Active Coupons (${activeCoupons.length})</div>
        <div id="rewards-coupons-container" class="rewards-coupon-list">
          ${activeCoupons.length === 0 
            ? `<div style="font-size:0.8rem; text-align:center; padding:12px; color:#a0958a;">No active coupons. Redeem points above to claim a coupon!</div>`
            : activeCoupons.map(c => `
                <div class="rewards-coupon-item">
                  <div class="rewards-coupon-details">
                    <div class="rewards-coupon-code">${c.code}</div>
                    <div class="rewards-coupon-label">${c.label}</div>
                  </div>
                  <button class="rewards-coupon-btn" data-copy="${c.code}">Copy Code</button>
                </div>
              `).join('')
          }
        </div>
        
        <!-- Logout Button -->
        <button id="rewards-logout-btn" class="rewards-btn" style="background:#6e6458; opacity:0.8; margin-top:30px;">Log Out of Bakes Club</button>
      </div>
    `;
    
    // Bind Daily Claim Button
    const claimBtn = document.getElementById('rewards-claim-btn');
    if (claimBtn && !isClaimedToday) {
      claimBtn.addEventListener('click', async () => {
        claimBtn.disabled = true;
        claimBtn.innerText = 'Claiming...';
        
        try {
          const res = await fetch(`${API_BASE}/api/users/daily-claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone })
          });
          
          const data = await res.json();
          
          if (res.ok) {
            currentUser = data.profile;
            localStorage.setItem('dreambakes_user', JSON.stringify(currentUser));
            showDrawerToast(`+${data.pointsEarned} Points Claimed! Streak: Day ${data.streakDay}`);
            
            // Fire confetti!
            triggerConfetti();
            
            window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: currentUser }));
            syncHeaderLink();
            
            // Re-render
            setTimeout(renderDrawerContent, 1000);
          } else {
            showDrawerToast(data.error || 'Failed to claim daily reward', 'error');
            claimBtn.disabled = false;
            claimBtn.innerText = 'Claim Daily Reward';
          }
        } catch (err) {
          showDrawerToast('Connection failed', 'error');
          console.error(err);
          claimBtn.disabled = false;
          claimBtn.innerText = 'Claim Daily Reward';
        }
      });
    }
    
    // Bind Redeem Buttons
    const redeemButtons = container.querySelectorAll('.rewards-redeem-btn');
    redeemButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const rewardType = btn.getAttribute('data-reward');
        btn.disabled = true;
        btn.innerText = 'Redeeming...';
        
        try {
          const res = await fetch(`${API_BASE}/api/users/redeem-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone, rewardType })
          });
          
          const data = await res.json();
          
          if (res.ok) {
            currentUser = data.profile;
            localStorage.setItem('dreambakes_user', JSON.stringify(currentUser));
            showDrawerToast(`Coupon Claimed! Code: ${data.code}`);
            
            // Fire confetti!
            triggerConfetti();
            
            window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: currentUser }));
            syncHeaderLink();
            renderDrawerContent();
          } else {
            showDrawerToast(data.error || 'Failed to redeem coupon', 'error');
            btn.disabled = false;
            btn.innerText = 'Redeem';
          }
        } catch (err) {
          showDrawerToast('Redemption failed', 'error');
          btn.disabled = false;
          btn.innerText = 'Redeem';
          console.error(err);
        }
      });
    });
    
    // Bind Copy Buttons
    const copyButtons = container.querySelectorAll('.rewards-coupon-btn');
    copyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(code).then(() => {
          btn.innerText = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerText = 'Copy Code';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          showDrawerToast('Failed to copy code. Please manually copy it.', 'error');
        });
      });
    });
    
    // Bind Logout Button
    document.getElementById('rewards-logout-btn').addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('dreambakes_user');
      showDrawerToast('Logged out of Bakes Club');
      window.dispatchEvent(new CustomEvent('dreambakes_user_updated', { detail: null }));
      syncHeaderLink();
      renderDrawerContent();
    });
  }
  
  // Confetti Animation Implementation
  function triggerConfetti() {
    const canvas = document.getElementById('rewards-confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    const colors = ['#e38c36', '#efe7d2', '#4a9070', '#c0524a', '#ffd700', '#ff69b4'];
    
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        radius: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.vx *= 0.98; // drag
        p.alpha -= 0.015;
        p.rotation += p.rotationSpeed;
        
        if (p.alpha > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.restore();
        }
      });
      
      if (active) {
        requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    update();
  }

  function formatFriendlyDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${month} ${day}`;
  }
})();
