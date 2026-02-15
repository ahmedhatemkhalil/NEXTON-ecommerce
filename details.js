// details.js
// Product Details Page

// 1. INITIALIZE CART
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];

// Initialize Wishlist
let wishlist = JSON.parse(localStorage.getItem('nextonWishlist')) || [];

// Update cart count (if element exists)
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cart.length;
    }
}

// Update wishlist count (if element exists)
function updateWishlistCount() {
    const wishlistCountEl = document.getElementById('wishlist-count');
    if (wishlistCountEl) {
        wishlistCountEl.textContent = wishlist.length;
    }
}

// Check if product is in wishlist
function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

// Add to wishlist
function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) {
        showMessage('Product not found!', 'error');
        return false;
    }

    if (isInWishlist(productId)) {
        showMessage('This product is already in your wishlist!', 'info');
        return false;
    }

    wishlist.push(product);
    localStorage.setItem('nextonWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    showMessage('Product added to wishlist!', 'success');
    return true;
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('nextonWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    showMessage('Product removed from wishlist!', 'success');
    return true;
}

// Toggle wishlist (add if not present, remove if present)
window.toggleWishlist = function(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId);
    }
    // Reload product to update button state
    loadProduct();
};

// 2. GET PRODUCT ID FROM URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

// 3. FIND & RENDER PRODUCT
function loadProduct() {
    const detailsContainer = document.getElementById('details-container');
    
    if (!productId || isNaN(productId)) {
        detailsContainer.innerHTML = `
            <div class="alert alert-danger">
                <h2>Invalid Product ID</h2>
                <p>Please select a valid product from the shop.</p>
                <a href="shop.html" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
        return;
    }

    // Use getProductById from products.js
    const product = getProductById(productId);

    // Safety check: What if the ID doesn't exist?
    if (!product) {
        detailsContainer.innerHTML = `
            <div class="alert alert-warning">
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="shop.html" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
        return;
    }

    // Check stock availability
    const stockStatus = product.stock > 0 
        ? (product.stock < 10 ? `<span class="badge bg-warning">Low Stock (${product.stock} left)</span>` : `<span class="badge bg-success">In Stock</span>`)
        : `<span class="badge bg-danger">Out of Stock</span>`;

    // Render the details
    detailsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-4">
        <div class="detail-image">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid rounded" 
                         onerror="this.src='https://via.placeholder.com/500'">
                </div>
        </div>
        
            <div class="col-md-6">
        <div class="detail-info">
                    <p class="detail-category text-muted mb-2">${product.category}</p>
                    <h1 class="mb-3">${product.name}</h1>
                    
                    <div class="mb-3">
                        ${product.ratings ? `
                            <div class="rating-stars mb-2">
                                <i class="bi bi-star-fill text-warning"></i>
                                <span class="fw-bold ms-1">${product.ratings}</span>
                                <span class="text-muted">(${product.reviewCount || 0} reviews)</span>
                            </div>
                        ` : ''}
                        ${stockStatus}
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="detail-price mb-2">$${product.price.toFixed(2)}</h3>
                        ${product.originalPrice && product.originalPrice > product.price ? `
                            <p class="text-muted text-decoration-line-through mb-0">$${parseFloat(product.originalPrice).toFixed(2)}</p>
                        ` : ''}
                    </div>
                    
                    ${product.sizes && product.sizes.length > 0 ? `
                        <div class="mb-3">
                            <label class="fw-bold">Available Sizes:</label>
                            <div class="d-flex gap-2 mt-2">
                                ${product.sizes.map(size => `<span class="badge bg-secondary">${size}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${product.colors && product.colors.length > 0 ? `
                        <div class="mb-3">
                            <label class="fw-bold">Available Colors:</label>
                            <div class="d-flex gap-2 mt-2">
                                ${product.colors.map(color => `<span class="badge bg-light text-dark border">${color}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <p class="detail-description mb-4">
                        ${product.description || 'No description available.'}
            </p>

                    <div class="action-area">
                        ${product.stock > 0 ? `
                            <button onclick="addToCartDetailed(${product.id})" class="btn btn-dark btn-lg w-100 mb-2">
                                <i class="bi bi-cart-plus"></i> ADD TO CART
                            </button>
                        ` : `
                            <button class="btn btn-secondary btn-lg w-100 mb-2" disabled>
                                <i class="bi bi-x-circle"></i> OUT OF STOCK
                            </button>
                        `}
                        <button onclick="toggleWishlist(${product.id})" class="btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'} btn-lg w-100" id="wishlist-btn-${product.id}">
                            <i class="bi ${isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'}"></i> 
                            ${isInWishlist(product.id) ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load recommended products (exclude current product)
    loadRecommendedProducts(productId, product.category);
}

// 4. LOAD RECOMMENDED PRODUCTS
function loadRecommendedProducts(currentProductId, currentCategory) {
    const recContainer = document.getElementById('rec-container');
    if (!recContainer) return;

    // Get products from the same category, excluding current product
    const allProducts = getProducts();
    const recommended = allProducts
        .filter(p => p.id !== currentProductId && p.category === currentCategory)
        .slice(0, 4); // Show max 4 recommended products

    if (recommended.length === 0) {
        // If no products in same category, show other products
        const otherProducts = allProducts
            .filter(p => p.id !== currentProductId)
            .slice(0, 4);
        displayRecommendedProducts(otherProducts, recContainer);
    } else {
        displayRecommendedProducts(recommended, recContainer);
    }
}

// 5. DISPLAY RECOMMENDED PRODUCTS
function displayRecommendedProducts(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No recommended products available.</p></div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="product-card">
                <div class="product-img-container position-relative">
                    <a href="details.html?id=${product.id}">
                        <img src="${product.image}" style="width: 100%;  object-fit: cover;" class="product-img" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/300'">
                    </a>
                    ${product.stock > 0 ? `
                        <div class="position-absolute top-0 end-0 p-2" style="z-index: 10;">
                            <div class="btn-wishlist bg-white rounded-circle p-2 shadow-sm" onclick="addToCartFromDetails(${product.id})" title="Add to Cart" style="cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                                <i class="bi bi-bag text-dark"></i>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="d-flex justify-content-between align-items-start" style="padding: 10px;">
                    <div>
                        <h3 class="product-title" style="font-size: 1.3rem;">${product.name}</h3>
                        <p class="product-cat">${product.category}</p>
                        ${product.ratings ? `
                            <div class="rating-stars">
                                <i class="bi bi-star-fill text-warning"></i>
                                <span class="text-dark fw-bold ms-1">${product.ratings}</span>
                                <span class="rating-count text-muted">(${product.reviewCount || 0})</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-end">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice && product.originalPrice > product.price ? `
                            <span class="product-price-old">$${parseFloat(product.originalPrice).toFixed(2)}</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 6. ADD TO CART LOGIC (with stock validation)
window.addToCartDetailed = function(id) {
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
        showMessage(`Sorry, only ${product.stock} item(s) available in stock. You already have ${currentCartQty} in your cart.`, 'error');
        return;
    }
    
    // Add to existing cart
    cart.push(product);
    
    // Save to LocalStorage
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    
    // Update visual count
    updateCartCount();
    
    // Show success message
    showMessage('Item added to cart successfully!', 'success');
};

// 7. ADD TO CART FROM RECOMMENDED PRODUCTS
window.addToCartFromDetails = function(id) {
    addToCartDetailed(id);
};


// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistCount();
    loadProduct();
});