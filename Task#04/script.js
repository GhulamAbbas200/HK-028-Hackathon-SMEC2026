// State Application
const AppState = {
    products: [],
    cart: [],
};

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalPriceEl = document.getElementById('cart-total-price');

// Constants
const API_URL = 'https://fakestoreapi.com/products';
const STORAGE_KEY = 'lumina_smart_cart';

// --- Initialization ---

async function init() {
    loadCart();
    renderCart(); // Initial render just in case loaded items exist
    updateCartCount();

    try {
        await fetchProducts();
    } catch (error) {
        productGrid.innerHTML = '<div class="error-msg">Failed to load products. Please try again later.</div>';
        console.error("API Error:", error);
    }
}

// --- API Handling ---

async function fetchProducts() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    AppState.products = await response.json();
    renderProducts(AppState.products);
}

// --- DOM Rendering ---

function renderProducts(products) {
    productGrid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (AppState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Start shopping!</div>';
        cartTotalPriceEl.textContent = '$0.00';
        return;
    }

    let total = 0;

    AppState.cart.forEach(item => {
        // Find product details from products array (ensure we have latest price/data)
        // Fallback to stored item data if product list isn't loaded yet
        const productData = AppState.products.find(p => p.id === item.id) || item;

        const itemTotal = productData.price * item.qty;
        total += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.classList.add('cart-item');
        cartItemEl.innerHTML = `
            <img src="${productData.image}" alt="${productData.title}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${productData.title}</div>
                <div class="cart-item-price">$${productData.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
}

// --- Cart Logic ---

window.addToCart = function (productId) {
    // 1. Check if product already in cart
    const existingItem = AppState.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        // Get full product object to store minimal info needed (in case API fails later)
        const product = AppState.products.find(p => p.id === productId);
        if (product) {
            AppState.cart.push({
                id: product.id,
                qty: 1,
                // Store backup data for persistence display even before API loads
                title: product.title,
                price: product.price,
                image: product.image
            });
        }
    }

    // Animation Effect for Cart Button
    const btn = document.querySelector(`button[onclick="addToCart(${productId})"]`);
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.background = '#4CAF50';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            btn.style.background = '';
        }, 1000);
    }

    saveCart();
    updateCartCount();
    renderCart(); // Update sidebar immediately if open

    // Optional: Open sidebar on add
    openCart();
};

window.removeFromCart = function (productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
};

window.updateQuantity = function (productId, change) {
    const item = AppState.cart.find(item => item.id === productId);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
        updateCartCount();
    }
};

function updateCartCount() {
    const count = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;

    // Bump animation
    cartCountEl.style.transform = 'scale(1.2)';
    setTimeout(() => cartCountEl.style.transform = 'scale(1)', 200);
}

// --- Persistence ---

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.cart));
}

function loadCart() {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (storedCart) {
        try {
            AppState.cart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Failed to parse cart storage", e);
            AppState.cart = [];
        }
    }
}

// --- Event Listeners & UI Controls ---

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
    document.querySelector('.checkout-btn').addEventListener('click', checkout);
});


// --- Checkout Logic ---

window.checkout = function () {
    if (AppState.cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Aesthetics for PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 12, 41); // Dark Blue
    doc.text("Lumina.", 20, 20);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Receipt", 160, 20);

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Order Details
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Order ID: #${Math.floor(Math.random() * 1000000)}`, 20, 40);

    // Table Header
    let y = 55;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 20, y);
    doc.text("Qty", 130, y);
    doc.text("Price", 160, y);

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Items
    doc.setFont("helvetica", "normal");
    let total = 0;

    AppState.cart.forEach(item => {
        const product = AppState.products.find(p => p.id === item.id) || item;
        const itemTotal = product.price * item.qty;
        total += itemTotal;

        // Truncate title if too long
        let title = product.title;
        if (title.length > 50) title = title.substring(0, 47) + "...";

        doc.text(title, 20, y);
        doc.text(item.qty.toString(), 130, y);
        doc.text(`$${itemTotal.toFixed(2)}`, 160, y);

        y += 10;
    });

    // Footer
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total: $${total.toFixed(2)}`, 160, y);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text("Thank you for shopping with Lumina!", 20, y + 20);

    // Save PDF
    doc.save("Lumina_Receipt.pdf");

    // Clear Cart
    AppState.cart = [];
    saveCart();
    renderCart();
    updateCartCount();
    closeCart();

    // Success Message
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Downloaded!";
    checkoutBtn.style.backgroundColor = "#4CAF50";

    setTimeout(() => {
        checkoutBtn.innerText = originalText;
        checkoutBtn.style.backgroundColor = "";
    }, 2000);
};
