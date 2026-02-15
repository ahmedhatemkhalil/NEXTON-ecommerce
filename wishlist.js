/* ============================================
   WISHLIST MANAGEMENT JAVASCRIPT
   ============================================
   This file handles all wishlist functionality:
   - Loading and displaying wishlist items
   - Removing items from wishlist
   - Adding items to cart from wishlist
   - Updating wishlist count in navigation
*/

// ============================================
// INITIALIZE WISHLIST
// ============================================
let wishlist = JSON.parse(localStorage.getItem('nextonWishlist')) || [];

// ============================================
// UPDATE WISHLIST COUNT
// ============================================
function updateWishlistCount() {
    const wishlistCountEl = document.getElementById('wishlist-count');
    if (wishlistCountEl) {
        wishlistCountEl.textContent = wishlist.length;
    }
    
    // Update header count
    const headerCountEl = document.getElementById('headerWishlistCount');
    if (headerCountEl) {
        const count = wishlist.length;
        headerCountEl.textContent = count === 1 ? '1 Item' : `${count} Items`;
    }
    
    // Show/hide page header
    const pageHeader = document.getElementById('pageHeader');
    if (pageHeader) {
        pageHeader.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// ============================================
// UPDATE CART COUNT
// ============================================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('nextonCart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cart.length;
    }
}

// ============================================
// DISPLAY WISHLIST ITEMS
// ============================================
function displayWishlist() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist">
                <i class="bi bi-heart"></i>
                <h3>Your wishlist is empty</h3>
                <p>Start adding products to your wishlist to save them for later!</p>
                <a href="shop.html" class="btn btn-dark mt-3">Browse Products</a>
            </div>
        `;
        return;
    }

    // Get current product data to show real-time stock and prices
    const wishlistHTML = wishlist.map(item => {
        // Get current product data from products.js
        let currentProduct = item;
        if (typeof getProductById !== 'undefined') {
            const updatedProduct = getProductById(item.id);
            if (updatedProduct) {
                currentProduct = updatedProduct;
            }
        }

        // Determine stock status
        const stock = currentProduct.stock || 0;
        const stockStatus = stock <= 0 ? 'out' : stock < 5 ? 'low' : 'available';
        const stockClass = `stock-${stockStatus}`;
        const stockText = stock <= 0 
            ? 'Out of Stock' 
            : stock < 5 
                ? `Low Stock (${stock} left)` 
                : `${stock} in stock`;

        // Calculate discount if original price exists
        const discount = currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price
            ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
            : 0;

        return `
            <div class="wishlist-item" data-product-id="${currentProduct.id}">
                <div class="wishlist-item-image">
                    ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
                    <a href="details.html?id=${currentProduct.id}">
                        <img src="${currentProduct.image || 'https://via.placeholder.com/300'}" 
                             alt="${currentProduct.name}" 
                             onerror="this.src='https://via.placeholder.com/300'">
                    </a>
                    <div class="wishlist-item-actions">
                        ${stock > 0 ? `
                            <button class="wishlist-action-btn cart-btn" 
                                    onclick="addToCartFromWishlist(${currentProduct.id})" 
                                    title="Add to Cart">
                                <i class="bi bi-bag"></i>
                            </button>
                        ` : ''}
                        <button class="wishlist-action-btn remove-btn" 
                                onclick="removeFromWishlist(${currentProduct.id})" 
                                title="Remove from Wishlist">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                    </div>
                </div>
                <div class="wishlist-item-info">
                    <h3><a href="details.html?id=${currentProduct.id}">${currentProduct.name}</a></h3>
                    <div class="wishlist-item-category">${currentProduct.category || 'Uncategorized'}</div>
                    <div class="wishlist-item-price-container">
                        <span class="wishlist-item-price">$${currentProduct.price.toFixed(2)}</span>
                        ${currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price ? `
                            <span class="wishlist-item-price-old">$${parseFloat(currentProduct.originalPrice).toFixed(2)}</span>
                        ` : ''}
                    </div>
                    <div class="wishlist-item-stock ${stockClass}">
                        <i class="bi bi-${stock <= 0 ? 'x-circle' : stock < 5 ? 'exclamation-triangle' : 'check-circle'}"></i>
                        ${stockText}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="wishlist-grid">${wishlistHTML}</div>`;
    
    // Update header visibility and count
    updateWishlistCount();
    updateHeaderVisibility();
}

// ============================================
// REMOVE FROM WISHLIST
// ============================================
window.removeFromWishlist = function(productId) {
    const product = wishlist.find(item => item.id === productId);
    const productName = product ? product.name : 'this item';

    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('nextonWishlist', JSON.stringify(wishlist));
    
    // Update count and display
    updateWishlistCount();
    displayWishlist();
    updateHeaderVisibility();
    
    showMessage(`"${productName}" has been removed from your wishlist.`, 'success');
};

// ============================================
// ADD TO CART FROM WISHLIST
// ============================================
window.addToCartFromWishlist = function(productId) {
    // Check if user is logged in
    const currentUser = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!currentUser) {
        showMessage('Please log in to add items to your cart. Redirecting to login page...', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return;
    }

    // Only customers can add to cart
    if (currentUser.role !== 'customer') {
        showMessage('Only customers can add items to cart.', 'error');
        return;
    }

    // Get product from products.js (to get current stock)
    if (typeof getProductById === 'undefined') {
        showMessage('Product system not available.', 'error');
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        showMessage('Product not found!', 'error');
        return;
    }

    // Check stock availability
    if (product.stock <= 0) {
        showMessage('Sorry, this product is out of stock!', 'error');
        displayWishlist(); // Refresh to show updated stock
        return;
    }

    // Get current cart
    let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];
    
    // Check if adding would exceed stock
    const currentCartQty = cart.filter(p => p.id === productId).length;
    if (currentCartQty >= product.stock) {
        showMessage(`Sorry, only ${product.stock} item(s) available in stock. You already have ${currentCartQty} in your cart.`, 'error');
        displayWishlist(); // Refresh to show updated stock
        return;
    }

    // Add to cart
    cart.push(product);
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showMessage('Item added to cart successfully!', 'success');
    
    // Refresh wishlist display to show updated stock
    displayWishlist();
};

// ============================================
// CLEAR WISHLIST
// ============================================
window.clearWishlist = function() {
    if (wishlist.length === 0) {
        showMessage('Your wishlist is already empty.', 'info');
        return;
    }

    if (confirm(`Are you sure you want to remove all ${wishlist.length} item(s) from your wishlist?`)) {
        wishlist = [];
        localStorage.setItem('nextonWishlist', JSON.stringify(wishlist));
        
        updateWishlistCount();
        displayWishlist();
        updateHeaderVisibility();
        
        showMessage('All items have been removed from your wishlist.', 'success');
    }
};

// ============================================
// UPDATE HEADER VISIBILITY
// ============================================
function updateHeaderVisibility() {
    const pageHeader = document.getElementById('pageHeader');
    if (pageHeader) {
        pageHeader.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// ============================================
// INITIALIZE PAGE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCount();
    updateCartCount();
    displayWishlist();
    updateHeaderVisibility();
});

