const API_URL = "http://127.0.0.1:8000";

let userNamesMap = {}; 

async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json", 
        ...options.headers 
    };
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (response.status === 401) logout();
    return response;
}

function toggleAuth() {
    document.getElementById("login-form").classList.toggle("hidden");
    document.getElementById("register-form").classList.toggle("hidden");
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    if (tabId === 'users-tab') {
        loadUsers();
    } else {
        const role = localStorage.getItem("role");
        if (role === "admin" || role === "manager") {
            loadUsers().then(() => loadMeals());
        } else {
            loadMeals();
        }
    }
}


async function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    const fd = new FormData();
    fd.append("username", u); 
    fd.append("password", p);

    const res = await fetch(`${API_URL}/login`, { method: "POST", body: fd });
    if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", u);
        
        const idToStore = data.user_id || data.id; 
        localStorage.setItem("userId", idToStore); 
        
        showApp();
    } else alert("Pogrešna prijava");
}

function logout() { 
    localStorage.clear(); 
    location.reload(); 
}

async function showApp() {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("app-section").classList.remove("hidden");
    document.getElementById("welcome-msg").innerText = `Korisnik: ${username} (${role})`;

    const personalSection = document.getElementById("admin-hide-this");
    const navUsers = document.getElementById("nav-users");
    const navContainer = document.querySelector("nav");
    const limitBox = document.querySelector("#admin-hide-this div[style*='background: #eee']");

    if (role === "manager") {
        personalSection.classList.add("hidden");
        if (limitBox) limitBox.classList.add("hidden");
        if (navContainer) navContainer.classList.add("hidden");
        loadUsers();
        switchTab('users-tab');
    } else if (role === "admin") {
        personalSection.classList.add("hidden");
        if (limitBox) limitBox.classList.add("hidden");
        if (navContainer) navContainer.classList.remove("hidden");
        navUsers.classList.remove("hidden");
        loadUsers();
        switchTab('meals-tab');
} else {
    personalSection.classList.remove("hidden");
    if (limitBox) limitBox.classList.remove("hidden");
    
    const userId = localStorage.getItem("userId");
    if (userId) {
    const userRes = await fetchWithAuth(`/users/${userId}`);
    if (userRes && userRes.ok) {
        const me = await userRes.json();
        document.getElementById("user-limit").value = me.expected_calories;
        
        await loadMeals(); 
    }
}
}
}

async function loadMeals() {
    const res = await fetchWithAuth("/meals/");
    if (res && res.ok) {
        const meals = await res.json();
        if (localStorage.getItem("role") === "user") updateDailyStatus(meals);
        renderMeals(meals);
    }
}

function renderMeals(meals) {
    const tbody = document.getElementById("meals-body");
    tbody.innerHTML = "";
    const role = localStorage.getItem("role");

    meals.forEach(m => {
        const displayName = userNamesMap[m.user_id] || `UID: ${m.user_id}`;
        const ownerInfo = (role === "admin" || role === "manager") 
            ? `<br><small style="color:blue; font-weight:bold;">Korisnik: ${displayName}</small>` 
            : "";

        tbody.innerHTML += `
            <tr>
                <td>${m.date}</td>
                <td>${m.time}</td>
                <td>${m.text}${ownerInfo}</td>
                <td>${m.calories}</td>
                <td>
                    <button onclick="editMeal(${m.id}, '${m.text}', ${m.calories}, '${m.date}', '${m.time}')" style="background:#2196F3; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Uredi</button>
                    <button onclick="deleteMeal(${m.id})" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Briši</button>
                </td>
            </tr>`;
    });
}

async function saveMeal() {
    const id = document.getElementById("meal-id").value;
    const mealData = {
        text: document.getElementById("meal-text").value,
        calories: parseFloat(document.getElementById("meal-calories").value),
        date: document.getElementById("meal-date").value,
        time: document.getElementById("meal-time").value || "12:00"
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `/meals/${id}` : "/meals/";

    const res = await fetchWithAuth(url, { method, body: JSON.stringify(mealData) });
    if (res.ok) {
        resetForm();
        loadMeals();
    }
}

function editMeal(id, text, calories, date, time) {
    const role = localStorage.getItem("role");
    const personalSection = document.getElementById("admin-hide-this");
    const limitBox = document.querySelector(".limit-box");

    if (role === "admin") {
        personalSection.classList.remove("hidden");
        if (limitBox) limitBox.classList.add("hidden"); 
    }

    document.getElementById("meal-id").value = id;
    document.getElementById("meal-text").value = text;
    document.getElementById("meal-calories").value = calories;
    document.getElementById("meal-date").value = date;
    document.getElementById("meal-time").value = time;
    
    document.getElementById("form-title").innerText = "Uređivanje obroka";
    document.getElementById("btn-save").innerText = "Sačuvaj promjene";
    document.getElementById("btn-cancel").classList.remove("hidden");
    window.scrollTo(0,0);
}

function resetForm() {
    const role = localStorage.getItem("role");
    
    document.getElementById("meal-id").value = "";
    document.getElementById("meal-text").value = "";
    document.getElementById("meal-calories").value = "";
    document.getElementById("meal-date").value = "";
    document.getElementById("meal-time").value = "";
    document.getElementById("form-title").innerText = "Dodaj novi obrok";
    document.getElementById("btn-save").innerText = "Dodaj obrok";
    document.getElementById("btn-cancel").classList.add("hidden");

    if (role === "admin") {
        document.getElementById("admin-hide-this").classList.add("hidden");
    }
}

async function deleteMeal(id) {
    if (confirm("Obrisati obrok?")) {
        const res = await fetchWithAuth(`/meals/${id}`, { method: "DELETE" });
        if (res.ok) loadMeals();
    }
}

async function loadUsers() {
    const res = await fetchWithAuth("/users/");
    if (res && res.ok) {
        const users = await res.json();
        
        userNamesMap = {};
        users.forEach(u => { userNamesMap[u.id] = u.username; });

        renderUsersTable(users);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById("users-body");
    tbody.innerHTML = "";
    const myRole = localStorage.getItem("role");
    
    const myUsername = localStorage.getItem("username");

    users.forEach(u => {
        let actions = "-";
        const isTargetAdmin = u.role === "admin";
        const isMe = u.username === myUsername; 
        
        const displayLimit = (isTargetAdmin || u.role === "manager") ? "-" : u.expected_calories;

        
        const canIEdit = (myRole === "admin" || myRole === "manager") && !isTargetAdmin;

        if (canIEdit) {
            const deleteBtn = isMe 
                ? `<span style="color:gray; font-size:0.8rem;">(Ne mozes brisati sebe)</span>` 
                : `<button onclick="deleteUser(${u.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Obriši</button>`;

            actions = `
                <button onclick='openUserModal(${JSON.stringify(u)})' style="background:orange; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Uredi</button>
                ${deleteBtn}
            `;
        }

        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.username} ${isTargetAdmin ? '(ADMIN)' : ''} ${isMe ? '<b>(VI)</b>' : ''}</td>
                <td>${u.role}</td>
                <td>${displayLimit}</td>
                <td>${actions}</td>
            </tr>
        `;
    });
}

function openUserModal(user) {
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-user-role").value = user.role;
    
    const limitInput = document.getElementById("edit-user-limit");
    limitInput.value = user.expected_calories;

    if (user.role === "admin" || user.role === "manager") {
        limitInput.disabled = true;
        limitInput.style.backgroundColor = "#eee";
    } else {
        limitInput.disabled = false;
        limitInput.style.backgroundColor = "#fff";
    }
    
    document.getElementById("user-edit-modal").style.display = "flex";
}

function closeUserModal() { 
    document.getElementById("user-edit-modal").style.display = "none"; 
}

document.getElementById("edit-user-role")?.addEventListener("change", function(e) {
    const limitInput = document.getElementById("edit-user-limit");
    if (e.target.value === "admin" || e.target.value === "manager") {
        limitInput.value = ""; 
        limitInput.disabled = true;
        limitInput.style.backgroundColor = "#eee";
    } else {
        limitInput.disabled = false;
        limitInput.style.backgroundColor = "#fff";
    }
});

async function saveUserChanges() {
    const id = document.getElementById("edit-user-id").value;
    const updateData = {
        role: document.getElementById("edit-user-role").value,
        expected_calories: parseInt(document.getElementById("edit-user-limit").value) || 0
    };

    const response = await fetchWithAuth(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
    });

    if (response.ok) {
        closeUserModal();
        loadUsers();
    } else {
        const errorData = await response.json();
        alert("Greška: " + (errorData.detail || "Neuspješno"));
    }
}

async function deleteUser(id) {
    if (confirm("Obrisati korisnika?")) {
        const res = await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
        if (res.ok) loadUsers();
    }
}

function updateDailyStatus(meals) {
    const limitInput = document.getElementById("user-limit");
    if (!limitInput) return;
    
    const limit = parseFloat(limitInput.value) || 2100;
    const today = new Date().toISOString().split('T')[0];
    const sum = meals.filter(m => m.date === today).reduce((s, m) => s + m.calories, 0);
    const div = document.getElementById("daily-status");
    
    if(div) {
        div.innerText = `Danas: ${sum} / ${limit} kcal`;
        div.style.background = sum > limit ? "#ff4444" : "#4CAF50";
        div.style.color = "white";
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`button[onclick*='${tabId}']`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabId === 'users-tab') {
        loadUsers();
    } else {
        loadUsers().then(() => loadMeals());
    }
}

async function updateLimit() {
    const newLimit = document.getElementById("user-limit").value;
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!userId || userId === "undefined") {
        console.error("Greška: userId nije pronađen u localStorage!");
        alert("Sesija je neispravna. Molimo odjavite se i prijavite ponovo.");
        return;
    }

    const updateData = {
        role: role,
        expected_calories: parseFloat(newLimit)
    };

    const res = await fetchWithAuth(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
    });

    if (res.ok) {
        await loadMeals(); 
        alert("Dnevni limit uspješno ažuriran!");
    }
}

if (localStorage.getItem("token")) showApp();