// Data Structure
const resources = [
    { id: 1, name: "Physics Lab A", type: "Lab" },
    { id: 2, name: "Main Auditorium", type: "Hall" },
    { id: 3, name: "4K Projector X1", type: "Equipment" },
    { id: 4, name: "Computer Lab 4", type: "Lab" },
    { id: 5, name: "Chemistry Lab", type: "Lab" },
    { id: 6, name: "Seminar Room 102", type: "Hall" }
];

// Array of existing/approved bookings (Backend simulation)
let bookings = [
    { id: 101, resId: 1, date: "2024-05-20", time: "Morning (09:00 - 12:00)", user: "Prof. Smith", status: "Approved" }
];

let activeResId = null;
let selectedDate = null;
let selectedTime = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const timeSlots = [
    "Morning (09:00 - 12:00)",
    "Afternoon (13:00 - 16:00)",
    "Evening (17:00 - 20:00)"
];

// Safe Icon Render
function safeCreateIcons() {
    try {
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        console.warn("Icon rendering failed:", e);
    }
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';

    toast.innerHTML = `
        <div class="toast-content">
            <i data-lucide="${icon}" style="color: ${type === 'success' ? 'var(--success)' : (type === 'error' ? 'var(--danger)' : 'var(--primary)')}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i data-lucide="x" size="16"></i></button>
    `;

    container.appendChild(toast);

    // Attempt icons
    safeCreateIcons();

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        if (toast && toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
        }
    }, 5000);

    // Cancel auto remove if manually closed
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            clearTimeout(autoRemove);
            toast.remove();
        };
    }
}

// --- Render Logic ---
function renderCatalog(data = resources) {
    const grid = document.getElementById('resourceGrid');
    grid.innerHTML = data.map((res, index) => `
    <div class="card fade-in" style="animation-delay: ${index * 0.05}s">
        <span class="tag">${res.type}</span>
        <h3 style="margin-bottom: 1.5rem; font-size: 1.25rem;">${res.name}</h3>
        <button class="btn btn-primary" onclick="openBooking(${res.id})">Book Now</button>
    </div>
`).join('');
    safeCreateIcons();
}

function filterResources() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = resources.filter(r => r.name.toLowerCase().includes(val) || r.type.toLowerCase().includes(val));
    renderCatalog(filtered);
}

function showView(view) {
    document.getElementById('catalog-view').classList.toggle('hidden', view !== 'catalog');
    document.getElementById('admin-view').classList.toggle('hidden', view !== 'admin');
    document.getElementById('nav-catalog').classList.toggle('active', view === 'catalog');
    document.getElementById('nav-admin').classList.toggle('active', view === 'admin');
    if (view === 'admin') renderAdmin();
}

// --- Calendar Logic ---
function renderCalendar(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearLabel = document.getElementById('currentMonthYear');

    // Clear previous
    calendarGrid.innerHTML = `
        <div class="weekday-header">Sun</div>
        <div class="weekday-header">Mon</div>
        <div class="weekday-header">Tue</div>
        <div class="weekday-header">Wed</div>
        <div class="weekday-header">Thu</div>
        <div class="weekday-header">Fri</div>
        <div class="weekday-header">Sat</div>
    `;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    monthYearLabel.innerText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isPast = new Date(dateStr) < new Date(today.setHours(0, 0, 0, 0));
        const isToday = dateStr === new Date().toISOString().split("T")[0];
        const isSelected = selectedDate === dateStr;

        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;
        dayEl.innerText = day;

        if (!isPast) {
            dayEl.onclick = () => selectDate(dateStr);
        }

        calendarGrid.appendChild(dayEl);
    }
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
}

function selectDate(date) {
    selectedDate = date;
    renderCalendar(currentYear, currentMonth);
    renderTimeSlots();
}

function renderTimeSlots() {
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';

    if (!selectedDate) {
        container.innerHTML = '<p style="font-size: 0.9rem; color: #94a3b8;">Select a date to see available slots.</p>';
        return;
    }

    timeSlots.forEach(slot => {
        const isTaken = bookings.some(b =>
            b.resId === activeResId &&
            b.date === selectedDate &&
            b.time === slot &&
            b.status !== "Declined"
        );

        const chip = document.createElement('div');
        chip.className = `time-chip ${isTaken ? 'booked' : ''} ${selectedTime === slot ? 'selected' : ''}`;
        chip.innerText = slot;

        if (!isTaken) {
            chip.onclick = () => {
                selectedTime = slot;
                renderTimeSlots();
            };
        } else {
            chip.title = "Already booked";
        }

        container.appendChild(chip);
    });
}

// --- Modal Controls ---
function openBooking(id) {
    activeResId = id;
    selectedDate = null;
    selectedTime = null;

    const res = resources.find(r => r.id === id);
    document.getElementById('modalTitle').innerText = `Book ${res.name}`;
    document.getElementById('bookingModal').style.display = 'flex';

    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    renderCalendar(currentYear, currentMonth);
    renderTimeSlots();
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// --- Backend Action ---
function confirmBooking() {
    if (!selectedDate || !selectedTime) {
        showToast("Please select both a date and a time slot.", 'error');
        return;
    }

    const btn = document.querySelector('#bookingModal .btn-primary');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    setTimeout(() => {
        try {
            // Detailed conflict check
            const conflict = bookings.find(b =>
                b.resId === activeResId &&
                b.date === selectedDate &&
                b.time === selectedTime &&
                b.status !== "Declined"
            );

            if (conflict) {
                showToast(`⚠️ Conflict: Slot already booked by ${conflict.user}`, 'error');
                renderTimeSlots();
            } else {
                const res = resources.find(r => r.id === activeResId);
                bookings.push({
                    id: Date.now(),
                    resId: activeResId,
                    resName: res.name,
                    user: "Student User",
                    date: selectedDate,
                    time: selectedTime,
                    status: "Pending"
                });
                showToast(`✅ Request Sent! ID: ${Date.now().toString().slice(-4)}`, 'success');
                closeModal();
                if (!document.getElementById('admin-view').classList.contains('hidden')) renderAdmin();
            }
        } catch (err) {
            console.error(err);
            showToast("An error occurred while processing.", 'error');
        } finally {
            // ALWAYS reset the button
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }, 600);
}

function renderAdmin() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = bookings.map(b => `
    <tr class="fade-in">
        <td><strong>${b.resName || resources.find(r => r.id === b.resId).name}</strong></td>
        <td>${b.user}</td>
        <td>${b.date} <br><small>${b.time}</small></td>
        <td><span style="color: ${b.status === 'Approved' ? 'var(--success)' : (b.status === 'Pending' ? '#f59e0b' : 'var(--danger)')}; font-weight: 600;">${b.status}</span></td>
        <td>
            <div style="display: flex; gap: 5px;">
                ${b.status === 'Pending' ? `
                    <button class="btn" style="width: auto; padding: 6px 10px; background: var(--success); color: white;" onclick="updateStatus(${b.id}, 'Approved')" title="Approve"><i data-lucide="check" size="16"></i></button>
                    <button class="btn" style="width: auto; padding: 6px 10px; background: var(--danger); color: white;" onclick="updateStatus(${b.id}, 'Declined')" title="Decline"><i data-lucide="x" size="16"></i></button>
                ` : `
                    <button class="btn" style="width: auto; padding: 6px 10px; background: #e2e8f0; color: #475569;" onclick="updateStatus(${b.id}, 'Pending')" title="Revoke Decision"><i data-lucide="rotate-ccw" size="16"></i></button>
                `}
                <button class="btn" style="width: auto; padding: 6px 10px; background: #fee2e2; color: var(--danger);" onclick="deleteBooking(${b.id})" title="Delete Permanently"><i data-lucide="trash-2" size="16"></i></button>
            </div>
        </td>
    </tr>
`).join('') || '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">No activity found</td></tr>';
    safeCreateIcons();
}

function updateStatus(id, newStatus) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    booking.status = newStatus;
    showToast(`Booking ${newStatus} for ${booking.user}`, newStatus === 'Approved' ? 'success' : 'info');
    renderAdmin();
}

function deleteBooking(id) {
    if (confirm("Are you sure you want to permanently delete this booking record?")) {
        bookings = bookings.filter(b => b.id !== id);
        showToast("Booking record deleted.", 'info');
        renderAdmin();
    }
}

function toggleSidebar() {
    document.querySelector('nav').classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const menuBtn = document.querySelector('.menu-btn');
    if (window.innerWidth <= 768 &&
        !nav.contains(e.target) &&
        !menuBtn.contains(e.target) &&
        nav.classList.contains('open')) {
        nav.classList.remove('open');
    }
});

// Init
renderCatalog();
safeCreateIcons();
