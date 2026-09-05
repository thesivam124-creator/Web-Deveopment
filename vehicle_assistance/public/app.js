/* RESCUDRIVE - CLIENT-SIDE APPLICATION LOGIC */

const API_BASE = '';

// GLOBAL STATE
let state = {
  activePortal: 'user', // 'user' | 'technician'
  userToken: localStorage.getItem('rescu_user_token') || null,
  user: JSON.parse(localStorage.getItem('rescu_user_data') || 'null'),
  techToken: localStorage.getItem('rescu_tech_token') || null,
  technician: JSON.parse(localStorage.getItem('rescu_tech_data') || 'null'),
  currentTechnicians: [],
  activeUserRequest: null,
  techRequests: []
};

// INITIALIZATION ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  renderAuthStatusBar();
  fetchTechnicians();
  
  if (state.user) {
    fetchUserActiveRequests();
    // Auto refresh user request status every 8 seconds
    setInterval(fetchUserActiveRequests, 8000);
  }

  if (state.technician && state.techToken) {
    loadTechDashboard();
    // Auto refresh technician incoming requests every 6 seconds
    setInterval(fetchTechnicianRequests, 6000);
  }
});

// PORTAL SWITCHING
function switchPortal(portal) {
  state.activePortal = portal;
  
  const userBtn = document.getElementById('nav-user-btn');
  const techBtn = document.getElementById('nav-tech-btn');
  const userPortal = document.getElementById('portal-user');
  const techPortal = document.getElementById('portal-technician');

  if (portal === 'user') {
    userBtn.classList.add('active');
    techBtn.classList.remove('active');
    userPortal.classList.add('active');
    techPortal.classList.remove('active');
    fetchTechnicians();
  } else {
    techBtn.classList.add('active');
    userBtn.classList.remove('active');
    techPortal.classList.add('active');
    userPortal.classList.remove('active');
    
    if (state.technician && state.techToken) {
      loadTechDashboard();
    } else {
      document.getElementById('tech-unauth-view').classList.remove('hidden');
      document.getElementById('tech-dashboard-view').classList.add('hidden');
    }
  }
}

// ==========================================
// USER PORTAL LOGIC & TECHNICIAN DISCOVERY
// ==========================================

function getUserLocation() {
  if ('geolocation' in navigator) {
    showToast('Detecting your GPS location...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById('user-lat-input').value = pos.coords.latitude.toFixed(4);
        document.getElementById('user-lng-input').value = pos.coords.longitude.toFixed(4);
        document.getElementById('user-address-input').value = `GPS: (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`;
        showToast('GPS Location acquired!', 'success');
        fetchTechnicians();
      },
      (err) => {
        showToast('Unable to access GPS. Using default city coordinates.', 'info');
      }
    );
  } else {
    showToast('Geolocation not supported by browser.', 'info');
  }
}

async function fetchTechnicians() {
  const lat = document.getElementById('user-lat-input').value;
  const lng = document.getElementById('user-lng-input').value;
  const vehicleType = document.getElementById('filter-vehicle-type').value;
  const skill = document.getElementById('filter-skill').value;
  const maxDistance = document.getElementById('filter-max-dist').value;
  const maxCharges = document.getElementById('filter-max-charges').value;

  const queryParams = new URLSearchParams({
    userLat: lat,
    userLng: lng,
    vehicleType: vehicleType !== 'All' ? vehicleType : '',
    skill: skill !== 'All' ? skill : '',
    maxDistance: maxDistance,
    maxCharges: maxCharges
  });

  const gridContainer = document.getElementById('technicians-grid');
  gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Locating available repair technicians...</p></div>';

  try {
    const res = await fetch(`${API_BASE}/api/user/technicians?${queryParams.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.currentTechnicians = data.technicians;
      document.getElementById('tech-count').innerText = data.count;
      renderTechnicianCards(data.technicians);
    } else {
      gridContainer.innerHTML = '<p class="error">Failed to load technicians.</p>';
    }
  } catch (err) {
    console.error('Error loading technicians:', err);
    gridContainer.innerHTML = '<p class="error">Server connection error.</p>';
  }
}

function renderTechnicianCards(technicians) {
  const container = document.getElementById('technicians-grid');
  if (!technicians || technicians.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 0.5rem;"></i>
        <h3>No Technicians Found Matching Filters</h3>
        <p style="color: #64748b;">Try adjusting your distance slider, vehicle category, or skill filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = technicians.map(tech => {
    const skillsHtml = (tech.skills || []).map(s => `<span class="tag tag-skill">${s}</span>`).join('');
    const vehiclesHtml = (tech.vehicleTypes || []).map(v => `<span class="tag tag-vehicle">${v}</span>`).join('');

    return `
      <div class="tech-card">
        <div>
          <div class="tech-header">
            <div class="tech-info">
              <h3>${tech.name}</h3>
              <div class="tech-business"><i class="fa-solid fa-warehouse"></i> ${tech.businessName}</div>
            </div>
            <div class="tech-rating">
              <i class="fa-solid fa-star"></i> ${tech.rating} (${tech.totalRepairsCompleted} jobs)
            </div>
          </div>

          <!-- KEY METRICS: DISTANCE, CHARGES, WAITING TIME -->
          <div class="tech-metrics">
            <div class="metric-item">
              <span class="metric-label"><i class="fa-solid fa-route"></i> Distance</span>
              <span class="metric-value highlight-dist">${tech.distanceKm} km</span>
            </div>
            <div class="metric-item">
              <span class="metric-label"><i class="fa-solid fa-indian-rupee-sign"></i> Total Fee</span>
              <span class="metric-value highlight-charge">₹${tech.totalCharges}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label"><i class="fa-solid fa-clock"></i> Wait Time</span>
              <span class="metric-value highlight-eta">~${tech.computedWaitTime} mins</span>
            </div>
          </div>

          <!-- SKILLS & VEHICLE COMPATIBILITY -->
          <div class="tags-section">
            <div class="tags-title">Expertise / Repair Skills</div>
            <div class="tags-wrapper">${skillsHtml}</div>
          </div>

          <div class="tags-section">
            <div class="tags-title">Vehicles Repaired</div>
            <div class="tags-wrapper">${vehiclesHtml}</div>
          </div>
        </div>

        <div class="tech-card-footer">
          <button class="btn-primary full-width" onclick="openRequestModal('${tech._id}')">
            <i class="fa-solid fa-headset"></i> Request Assistance (₹${tech.totalCharges})
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// REQUEST ASSISTANCE & USER ACTIVE STATUS
// ==========================================

function openRequestModal(techId) {
  if (!state.user) {
    showToast('Please login or register a user account to book assistance.', 'info');
    openUserAuthModal('login');
    return;
  }

  const tech = state.currentTechnicians.find(t => (t._id === techId || t.id === techId));
  if (!tech) return;

  document.getElementById('req-tech-id').value = tech._id || tech.id;
  document.getElementById('request-summary-box').innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
      <h4 style="font-size:1.1rem; color:#0f172a;"><i class="fa-solid fa-user-check"></i> ${tech.name}</h4>
      <span style="font-weight:700; color:#2563eb;">Est. Total: ₹${tech.totalCharges}</span>
    </div>
    <p style="font-size:0.85rem; color:#64748b; margin-bottom: 0.4rem;">
      <i class="fa-solid fa-store"></i> <strong>${tech.businessName}</strong> &bull; ${tech.phone}
    </p>
    <div style="display:flex; gap: 1.5rem; font-size:0.85rem; color:#475569; background:#fff; padding:0.5rem; border-radius:6px; border:1px solid #e2e8f0;">
      <span><strong>Distance:</strong> ${tech.distanceKm} km</span>
      <span><strong>Wait Arrival Time:</strong> ~${tech.computedWaitTime} mins</span>
    </div>
  `;

  document.getElementById('request-assistance-modal').classList.remove('hidden');
}

function closeRequestModal() {
  document.getElementById('request-assistance-modal').classList.add('hidden');
}

async function handleSendAssistanceRequest(e) {
  e.preventDefault();
  const techId = document.getElementById('req-tech-id').value;
  const problemType = document.getElementById('req-problem-type').value;
  const notes = document.getElementById('req-notes').value;
  const userLat = document.getElementById('user-lat-input').value;
  const userLng = document.getElementById('user-lng-input').value;
  const userAddress = document.getElementById('user-address-input').value;
  const vehicleType = document.getElementById('filter-vehicle-type').value;

  const payload = {
    userId: state.user.id || state.user._id,
    userName: state.user.name,
    userPhone: state.user.phone,
    technicianId: techId,
    vehicleType: vehicleType !== 'All' ? vehicleType : (state.user.vehicleDetails ? state.user.vehicleDetails.vehicleType : 'Car / Sedan / SUV'),
    problemType,
    problemDescription: notes,
    userLat,
    userLng,
    userAddress
  };

  try {
    const res = await fetch(`${API_BASE}/api/user/request-assistance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Assistance request sent to technician successfully!', 'success');
      closeRequestModal();
      fetchUserActiveRequests();
    } else {
      showToast(data.message || 'Failed to dispatch request.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Network error dispatching request.', 'error');
  }
}

async function fetchUserActiveRequests() {
  if (!state.user) return;
  const userId = state.user.id || state.user._id;

  try {
    const res = await fetch(`${API_BASE}/api/user/requests/${userId}`);
    const data = await res.json();

    if (data.success && data.requests && data.requests.length > 0) {
      const active = data.requests.find(r => r.status !== 'completed' && r.status !== 'cancelled') || data.requests[0];
      state.activeUserRequest = active;
      renderActiveUserRequestBanner(active);
    } else {
      document.getElementById('user-active-request-bar').classList.add('hidden');
    }
  } catch (err) {
    console.error(err);
  }
}

function renderActiveUserRequestBanner(req) {
  const container = document.getElementById('user-active-request-bar');
  if (!req) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  const statusMap = {
    pending: { step: 1, text: 'Awaiting Technician Response', color: '#f59e0b' },
    accepted: { step: 2, text: 'Technician Accepted Request', color: '#2563eb' },
    in_transit: { step: 3, text: 'Technician En Route to your location', color: '#8b5cf6' },
    completed: { step: 4, text: 'Repair Completed', color: '#10b981' },
    cancelled: { step: 0, text: 'Request Cancelled', color: '#ef4444' }
  };

  const currentInfo = statusMap[req.status] || statusMap.pending;

  container.innerHTML = `
    <div class="status-tracker-box">
      <div class="tracker-header">
        <div>
          <span style="font-size:0.8rem; font-weight:700; color:#2563eb; text-transform:uppercase;">Active Roadside Call</span>
          <h3 style="font-size:1.15rem; margin-top:0.2rem;"><i class="fa-solid fa-truck-pickup"></i> ${req.technicianName}</h3>
        </div>
        <div style="text-align:right;">
          <span style="background:${currentInfo.color}; color:#fff; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.82rem; font-weight:700;">
            ${currentInfo.text}
          </span>
          <p style="font-size:0.8rem; color:#64748b; margin-top:0.3rem;">Est. Charge: <strong>₹${req.totalCharges}</strong> | Wait: <strong>~${req.estimatedWaitTime} mins</strong></p>
        </div>
      </div>

      <div class="status-steps">
        <div class="step-item ${currentInfo.step >= 1 ? (currentInfo.step === 1 ? 'active' : 'done') : ''}">1. Requested</div>
        <div class="step-item ${currentInfo.step >= 2 ? (currentInfo.step === 2 ? 'active' : 'done') : ''}">2. Accepted</div>
        <div class="step-item ${currentInfo.step >= 3 ? (currentInfo.step === 3 ? 'active' : 'done') : ''}">3. Mechanic En Route</div>
        <div class="step-item ${currentInfo.step >= 4 ? 'done' : ''}">4. Resolved</div>
      </div>
    </div>
  `;
}

// ==========================================
// USER AUTHENTICATION & MODAL LOGIC
// ==========================================

function renderAuthStatusBar() {
  const container = document.getElementById('auth-status-bar');
  if (state.user) {
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.6rem; color:#fff; font-size:0.85rem; font-weight:600;">
        <i class="fa-solid fa-circle-user" style="font-size:1.2rem; color:#f59e0b;"></i>
        <span>${state.user.name}</span>
        <button class="btn-secondary btn-sm" onclick="logoutUser()">Logout</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn-primary btn-sm" onclick="openUserAuthModal('login')">
        <i class="fa-solid fa-user"></i> Login / Register User
      </button>
    `;
  }
}

function openUserAuthModal(mode = 'login') {
  toggleUserModalAuth(mode);
  document.getElementById('user-auth-modal').classList.remove('hidden');
}

function closeUserAuthModal() {
  document.getElementById('user-auth-modal').classList.add('hidden');
}

function toggleUserModalAuth(mode) {
  const loginForm = document.getElementById('user-login-form');
  const regForm = document.getElementById('user-register-form');
  const loginTab = document.getElementById('user-modal-tab-login');
  const regTab = document.getElementById('user-modal-tab-reg');

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginTab.classList.add('active');
    regTab.classList.remove('active');
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}

async function handleUserLogin(e) {
  e.preventDefault();
  const email = document.getElementById('user-login-email').value;
  const password = document.getElementById('user-login-password').value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      state.userToken = data.token;
      state.user = data.user;
      localStorage.setItem('rescu_user_token', data.token);
      localStorage.setItem('rescu_user_data', JSON.stringify(data.user));
      
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      closeUserAuthModal();
      renderAuthStatusBar();
      fetchUserActiveRequests();
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Server connection error during login.', 'error');
  }
}

async function handleUserRegister(e) {
  e.preventDefault();
  const name = document.getElementById('user-reg-name').value;
  const email = document.getElementById('user-reg-email').value;
  const password = document.getElementById('user-reg-password').value;
  const phone = document.getElementById('user-reg-phone').value;
  const vehicleMake = document.getElementById('user-reg-make').value;
  const vehicleModel = document.getElementById('user-reg-model').value;
  const vehicleType = document.getElementById('user-reg-vehicletype').value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, vehicleMake, vehicleModel, vehicleType })
    });
    const data = await res.json();

    if (data.success) {
      state.userToken = data.token;
      state.user = data.user;
      localStorage.setItem('rescu_user_token', data.token);
      localStorage.setItem('rescu_user_data', JSON.stringify(data.user));

      showToast(`User registration successful! Welcome, ${data.user.name}.`, 'success');
      closeUserAuthModal();
      renderAuthStatusBar();
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    showToast('Server connection error during registration.', 'error');
  }
}

function logoutUser() {
  state.userToken = null;
  state.user = null;
  localStorage.removeItem('rescu_user_token');
  localStorage.removeItem('rescu_user_data');
  showToast('Logged out of user account.', 'info');
  renderAuthStatusBar();
  document.getElementById('user-active-request-bar').classList.add('hidden');
}


// ==========================================
// TECHNICIAN PORTAL LOGIC
// ==========================================

function toggleTechAuthMode(mode) {
  const loginForm = document.getElementById('tech-login-form');
  const regForm = document.getElementById('tech-register-form');
  const loginBtn = document.getElementById('tech-tab-login');
  const regBtn = document.getElementById('tech-tab-register');

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginBtn.classList.add('active');
    regBtn.classList.remove('active');
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regBtn.classList.add('active');
    loginBtn.classList.remove('active');
  }
}

async function handleTechLogin(e) {
  e.preventDefault();
  const email = document.getElementById('tech-login-email').value;
  const password = document.getElementById('tech-login-password').value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/technician/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      state.techToken = data.token;
      state.technician = data.technician;
      localStorage.setItem('rescu_tech_token', data.token);
      localStorage.setItem('rescu_tech_data', JSON.stringify(data.technician));

      showToast(`Logged in as Technician: ${data.technician.name}`, 'success');
      loadTechDashboard();
    } else {
      showToast(data.message || 'Technician login failed', 'error');
    }
  } catch (err) {
    showToast('Server connection error during login.', 'error');
  }
}

async function handleTechRegister(e) {
  e.preventDefault();
  const name = document.getElementById('tech-reg-name').value;
  const email = document.getElementById('tech-reg-email').value;
  const password = document.getElementById('tech-reg-password').value;
  const phone = document.getElementById('tech-reg-phone').value;
  const businessName = document.getElementById('tech-reg-business').value;
  const baseFee = document.getElementById('tech-reg-basefee').value;
  const ratePerKm = document.getElementById('tech-reg-ratekm').value;
  const estimatedWaitTime = document.getElementById('tech-reg-waittime').value;
  const address = document.getElementById('tech-reg-address').value;
  const lat = document.getElementById('tech-reg-lat').value;
  const lng = document.getElementById('tech-reg-lng').value;

  // Selected skills
  const skillEls = document.querySelectorAll('input[name="tech-skills"]:checked');
  const skills = Array.from(skillEls).map(el => el.value);

  // Selected vehicle types
  const vehicleEls = document.querySelectorAll('input[name="tech-vehicles"]:checked');
  const vehicleTypes = Array.from(vehicleEls).map(el => el.value);

  const payload = {
    name, email, password, phone, businessName, baseFee, ratePerKm, estimatedWaitTime, address, lat, lng, skills, vehicleTypes
  };

  try {
    const res = await fetch(`${API_BASE}/api/auth/technician/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      state.techToken = data.token;
      state.technician = data.technician;
      localStorage.setItem('rescu_tech_token', data.token);
      localStorage.setItem('rescu_tech_data', JSON.stringify(data.technician));

      showToast(`Technician Registration Successful! Welcome, ${data.technician.name}.`, 'success');
      loadTechDashboard();
    } else {
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    showToast('Server connection error during technician registration.', 'error');
  }
}

function loadTechDashboard() {
  document.getElementById('tech-unauth-view').classList.add('hidden');
  document.getElementById('tech-dashboard-view').classList.remove('hidden');

  const tech = state.technician;
  document.getElementById('dash-tech-name').innerText = tech.name;
  document.getElementById('dash-tech-business').innerText = tech.businessName || 'Independent Garage';

  // Toggle availability state
  const availToggle = document.getElementById('tech-availability-toggle');
  availToggle.checked = tech.isAvailable !== false;
  updateAvailBadge(availToggle.checked);

  // Populate edit form
  document.getElementById('dash-edit-business').value = tech.businessName || '';
  document.getElementById('dash-edit-phone').value = tech.phone || '';
  document.getElementById('dash-edit-basefee').value = tech.charges ? tech.charges.baseFee : 350;
  document.getElementById('dash-edit-ratekm').value = tech.charges ? tech.charges.ratePerKm : 25;
  document.getElementById('dash-edit-waittime').value = tech.estimatedWaitTime || 15;

  // Populate checkboxes
  const userSkills = tech.skills || [];
  document.querySelectorAll('input[name="dash-skills"]').forEach(cb => {
    cb.checked = userSkills.includes(cb.value);
  });

  const userVehicles = tech.vehicleTypes || [];
  document.querySelectorAll('input[name="dash-vehicles"]').forEach(cb => {
    cb.checked = userVehicles.includes(cb.value);
  });

  fetchTechnicianRequests();
}

async function updateTechAvailability(isAvailable) {
  updateAvailBadge(isAvailable);
  const techId = state.technician._id || state.technician.id;

  try {
    const res = await fetch(`${API_BASE}/api/technician/profile/${techId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable })
    });
    const data = await res.json();
    if (data.success) {
      state.technician = data.technician;
      localStorage.setItem('rescu_tech_data', JSON.stringify(data.technician));
      showToast(`Status updated: ${isAvailable ? 'Online & Available' : 'Offline'}`, 'info');
    }
  } catch (err) {
    console.error(err);
  }
}

function updateAvailBadge(isAvailable) {
  const badge = document.getElementById('tech-avail-text');
  if (isAvailable) {
    badge.innerText = 'Online & Available';
    badge.className = 'status-badge available';
  } else {
    badge.innerText = 'Offline / Busy';
    badge.className = 'status-badge offline';
  }
}

async function handleUpdateTechProfile(e) {
  e.preventDefault();
  const techId = state.technician._id || state.technician.id;
  const businessName = document.getElementById('dash-edit-business').value;
  const phone = document.getElementById('dash-edit-phone').value;
  const baseFee = document.getElementById('dash-edit-basefee').value;
  const ratePerKm = document.getElementById('dash-edit-ratekm').value;
  const estimatedWaitTime = document.getElementById('dash-edit-waittime').value;

  const skillEls = document.querySelectorAll('input[name="dash-skills"]:checked');
  const skills = Array.from(skillEls).map(el => el.value);

  const vehicleEls = document.querySelectorAll('input[name="dash-vehicles"]:checked');
  const vehicleTypes = Array.from(vehicleEls).map(el => el.value);

  try {
    const res = await fetch(`${API_BASE}/api/technician/profile/${techId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, phone, baseFee, ratePerKm, estimatedWaitTime, skills, vehicleTypes })
    });
    const data = await res.json();

    if (data.success) {
      state.technician = data.technician;
      localStorage.setItem('rescu_tech_data', JSON.stringify(data.technician));
      showToast('Technician profile and charges updated!', 'success');
      fetchTechnicians();
    } else {
      showToast(data.message || 'Profile update failed.', 'error');
    }
  } catch (err) {
    showToast('Server connection error.', 'error');
  }
}

async function fetchTechnicianRequests() {
  if (!state.technician) return;
  const techId = state.technician._id || state.technician.id;

  try {
    const res = await fetch(`${API_BASE}/api/technician/requests/${techId}`);
    const data = await res.json();

    if (data.success) {
      state.techRequests = data.requests;
      renderTechnicianRequests(data.requests);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderTechnicianRequests(requests) {
  const container = document.getElementById('tech-requests-list');
  if (!requests || requests.length === 0) {
    container.innerHTML = '<p style="color:#64748b; text-align:center; padding:2rem;"><i class="fa-solid fa-inbox"></i> No incoming calls yet. Stay online to receive breakdown alerts.</p>';
    return;
  }

  container.innerHTML = requests.map(req => {
    return `
      <div class="request-item-card">
        <div class="req-header">
          <div>
            <span class="req-user-name"><i class="fa-solid fa-user-gear"></i> ${req.userName}</span>
            <span style="font-size:0.8rem; color:#64748b; margin-left:0.5rem;"><i class="fa-solid fa-phone"></i> ${req.userPhone}</span>
          </div>
          <span class="req-status-pill ${req.status}">${req.status.replace('_', ' ')}</span>
        </div>

        <div style="font-size:0.9rem; font-weight:700; color:#b45309; background:#fff8f1; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid #ffedd5;">
          <i class="fa-solid fa-triangle-exclamation"></i> ${req.problemType}
          ${req.problemDescription ? `<p style="font-size:0.8rem; font-weight:normal; color:#475569; margin-top:0.2rem;">"${req.problemDescription}"</p>` : ''}
        </div>

        <div class="req-detail-row">
          <span><i class="fa-solid fa-car"></i> ${req.vehicleType}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${req.userLocation ? req.userLocation.address : 'Location'}</span>
          <span><i class="fa-solid fa-indian-rupee-sign"></i> ₹${req.totalCharges}</span>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          ${req.status === 'pending' ? `
            <button class="btn-primary btn-sm" onclick="updateRequestStatus('${req._id || req.id}', 'accepted')">
              <i class="fa-solid fa-check"></i> Accept Call
            </button>
          ` : ''}
          ${req.status === 'accepted' ? `
            <button class="btn-primary btn-sm" style="background:#8b5cf6;" onclick="updateRequestStatus('${req._id || req.id}', 'in_transit')">
              <i class="fa-solid fa-truck-fast"></i> Mark En Route
            </button>
          ` : ''}
          ${req.status === 'in_transit' ? `
            <button class="btn-primary btn-sm" style="background:#10b981;" onclick="updateRequestStatus('${req._id || req.id}', 'completed')">
              <i class="fa-solid fa-circle-check"></i> Complete Repair
            </button>
          ` : ''}
          ${(req.status === 'pending' || req.status === 'accepted') ? `
            <button class="btn-secondary btn-sm" onclick="updateRequestStatus('${req._id || req.id}', 'cancelled')">Cancel</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function updateRequestStatus(requestId, status) {
  try {
    const res = await fetch(`${API_BASE}/api/technician/request/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Request updated to ${status}`, 'success');
      fetchTechnicianRequests();
    } else {
      showToast(data.message || 'Failed to update request', 'error');
    }
  } catch (err) {
    showToast('Server error updating request.', 'error');
  }
}

function logoutTech() {
  state.techToken = null;
  state.technician = null;
  localStorage.removeItem('rescu_tech_token');
  localStorage.removeItem('rescu_tech_data');
  showToast('Logged out of technician dashboard.', 'info');
  document.getElementById('tech-unauth-view').classList.remove('hidden');
  document.getElementById('tech-dashboard-view').classList.add('hidden');
}


// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
