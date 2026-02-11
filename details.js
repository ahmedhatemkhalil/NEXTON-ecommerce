// details.js
// Product Details Page

// 1. INITIALIZE CART
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];

// Update cart count (if element exists)
function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cart.length;
    }
}

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
                        <button class="btn btn-outline-dark btn-lg w-100">
                            <i class="bi bi-heart"></i> ADD TO WISHLIST
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
                <div class="product-img-container">
                    <a href="details.html?id=${product.id}">
                        <img src="${product.image}" class="product-img" alt="${product.name}" 
                             onerror="this.src='https://via.placeholder.com/300'">
                    </a>
                    ${product.stock > 0 ? `
                        <div class="btn-wishlist" onclick="addToCartFromDetails(${product.id})">
                            <i class="bi bi-bag"></i>
                        </div>
                    ` : ''}
                </div>
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h3 class="product-title">${product.name}</h3>
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
    loadProduct();
});