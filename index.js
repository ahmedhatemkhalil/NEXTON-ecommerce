// index.js
// Home Page Functionality

// 1. INITIALIZE CART
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];

// Update cart count
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cart.length;
    }
}

// 2. ADD TO CART FUNCTION
window.addToCart = function(id) {
    // Check if user is logged in
    const currentUser = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!currentUser) {
        showMessage('Please log in to add items to your cart. Redirecting to login page...', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return;
    }

    // Only customers can add to cart (admins cannot)
    if (currentUser.role !== 'customer') {
        showMessage('Only customers can add items to cart.', 'error');
        return;
    }

    const product = getProductById(id);
    
    if (!product) {
        showMessage('Product not found!', 'error');
        return;
    }

    // Check stock availability
    if (product.stock <= 0) {
        showMessage('Sorry, this product is out of stock!', 'error');
        return;
    }

    // Check if adding would exceed stock
    const currentCartQty = cart.filter(p => p.id === id).length;
    if (currentCartQty >= product.stock) {
        showMessage(`Sorry, only ${product.stock} item(s) available in stock.`, 'error');
        return;
    }
    
    // Add to cart
    cart.push(product);
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    showMessage('Item added to cart successfully!', 'success');
};

// 3. DISPLAY PRODUCTS IN SECTION
function displayProductsInSection(products, containerId, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const productsToShow = products.slice(0, limit);

    if (productsToShow.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No products available.</p></div>';
        return;
    }

    container.innerHTML = productsToShow.map(product => {
        const discount = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
        
        const stockBadge = product.stock <= 0 
            ? '<span class="badge bg-danger rounded-pill">Out of Stock</span>'
            : product.stock < 10 
                ? `<span class="badge bg-warning rounded-pill">Low Stock</span>`
                : '';

        return `
            <div class="col-lg-3 col-md-6 col-sm-6">
                <div class="card product-card h-100 border-0 shadow-sm">
                    <div class="position-relative">
                        <a href="details.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                                 onerror="this.src='https://via.placeholder.com/300'">
                        </a>
                        ${discount > 0 ? `<span class="badge discount-badge bg-light text-dark rounded-pill">${discount}% Discount</span>` : ''}
                        ${stockBadge}
                        ${product.stock > 0 ? `
                            <button class="btn bookmark-btn" onclick="addToCart(${product.id}); event.stopPropagation();" title="Add to Cart">
                                <i class="bi bi-bag"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="card-body">
                        <a href="details.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                            <h5 class="card-title product-name">${product.name}</h5>
                            <p class="card-text product-category text-muted small">${product.category}</p>
                        </a>
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <div>
                                <span class="product-price">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice && product.originalPrice > product.price ? `
                                    <span class="product-price-old text-muted text-decoration-line-through ms-2">$${parseFloat(product.originalPrice).toFixed(2)}</span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            ${product.ratings ? `
                                <div class="rating">
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <span class="rating-value">${product.ratings}</span>
                                    <span class="rating-count text-muted">(${product.reviewCount || 0})</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 4. LOAD RECOMMENDATIONS
function loadRecommendations() {
    const allProducts = getProducts();
    // Get random products or first 4 products
    const recommendations = allProducts.slice(0, 4);
    displayProductsInSection(recommendations, 'recommendations-container');
}

// 5. LOAD BEST SELLERS
function loadBestSellers() {
    const allProducts = getProducts();
    // Get products sorted by ratings (best sellers)
    const bestSellers = [...allProducts]
        .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
        .slice(5,9);
    displayProductsInSection(bestSellers, 'bestsellers-container');
}

// 6. UPDATE WISHLIST COUNT
function updateWishlistCount() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('nextonWishlist')) || [];
        const wishlistCountEl = document.getElementById('wishlist-count');
        if (wishlistCountEl) {
            wishlistCountEl.textContent = wishlist.length;
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
    }
}

// 7. INITIALIZE PAGE
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistCount();
    
    // Load products if containers exist
    if (document.getElementById('recommendations-container')) {
        loadRecommendations();
    }
    
    if (document.getElementById('bestsellers-container')) {
        loadBestSellers();
    }
});

