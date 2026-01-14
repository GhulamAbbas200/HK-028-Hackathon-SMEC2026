const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const productsGrid = document.getElementById('productsGrid');
const bestDealContainer = document.getElementById('bestDealContainer');
const bestDealSection = document.getElementById('bestDealSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsCount = document.getElementById('resultsCount');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Reset UI
    productsGrid.innerHTML = '';
    bestDealSection.classList.add('hidden');
    resultsCount.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    try {
        // Fetch from all APIs concurrently
        const results = await Promise.all([
            fetchDummyJSON(query),
            fetchFakeStore(query),
            fetchPlatzi(query)
        ]);

        // Flatten results
        const allProducts = results.flat();

        loadingSpinner.classList.add('hidden');
        renderResults(allProducts);

    } catch (error) {
        console.error('Error fetching data:', error);
        loadingSpinner.classList.add('hidden');
        productsGrid.innerHTML = `<div class="empty-state"><p>Something went wrong. Please try again.</p></div>`;
    }
}

// --- API Fetch Functions ---

// 1. DummyJSON (Has native search)
async function fetchDummyJSON(query) {
    try {
        const res = await fetch(`https://dummyjson.com/products/search?q=${query}`);
        const data = await res.json();
        return data.products.map(p => ({
            id: `dj-${p.id}`,
            title: p.title,
            price: p.price,
            image: p.thumbnail,
            source: 'DummyJSON',
            link: '#' // Mocks usually don't have deep links
        }));
    } catch (e) {
        console.error('DummyJSON failed', e);
        return [];
    }
}

// 2. Fake Store API (No search, fetch all & filter)
async function fetchFakeStore(query) {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        const filtered = data.filter(p => p.title.toLowerCase().includes(query));
        return filtered.map(p => ({
            id: `fs-${p.id}`,
            title: p.title,
            price: p.price,
            image: p.image,
            source: 'FakeStore',
            link: '#'
        }));
    } catch (e) {
        console.error('FakeStore failed', e);
        return [];
    }
}

// 3. Platzi Fake Store (Has title filter)
async function fetchPlatzi(query) {
    try {
        const res = await fetch(`https://api.escuelajs.co/api/v1/products/?title=${query}`);
        const data = await res.json();
        // Platzi sometimes returns weird images or errors, filter cleanly
        return data.slice(0, 10).map(p => ({
            id: `pz-${p.id}`,
            title: p.title,
            price: p.price,
            // Clean up image URLs if they are stringified JSON (common Platzi issue)
            image: cleanPlatziImage(p.images[0]),
            source: 'Platzi',
            link: '#'
        }));
    } catch (e) {
        console.error('Platzi failed', e);
        return [];
    }
}

function cleanPlatziImage(imgUrl) {
    if (!imgUrl) return 'https://via.placeholder.com/200?text=No+Image';
    // Sometimes Platzi returns "[\"url\"]"
    if (imgUrl.startsWith('["') && imgUrl.endsWith('"]')) {
        return imgUrl.replace('["', '').replace('"]', '');
    }
    return imgUrl;
}

// --- Rendering Logic ---

function renderResults(products) {
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ghost"></i>
                <p>No products found. Try a broader search term like "phone" or "shirt".</p>
            </div>`;
        return;
    }

    resultsCount.textContent = `${products.length} products found`;
    resultsCount.classList.remove('hidden');

    // Find Best Price
    // Sort by price ascending
    const sortedDetails = [...products].sort((a, b) => a.price - b.price);
    const bestDeal = sortedDetails[0];

    renderBestDeal(bestDeal);
    
    // Render Grid (excluding best deal?) -> No, show all in grid, highlight best separately
    products.forEach(product => {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
    });
}

function renderBestDeal(product) {
    bestDealSection.classList.remove('hidden');
    bestDealContainer.innerHTML = `
        <div class="product-card best-deal-card">
            <div class="best-deal-badge"><i class="fa-solid fa-star"></i> LOWEST PRICE</div>
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-details">
                <div class="product-source">${product.source}</div>
                <h3 class="product-title">${product.title}</h3>
                <p>Found the best price at <strong>${product.source}</strong> among ${resultsCount.textContent}</p>
                <div class="product-price">$${product.price}</div>
            </div>
        </div>
    `;
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-details">
            <div class="product-source">${product.source}</div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price}</div>
        </div>
    `;
    return div;
}
