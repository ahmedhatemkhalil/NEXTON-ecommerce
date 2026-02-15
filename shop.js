// shop.js

// 1. GET DATA
const allProducts = getProducts(); // From products.js
const container = document.getElementById('product-container');

// 2. SETUP CART COUNT
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];
const cartCount = document.getElementById('cart-count');
if(cartCount) cartCount.textContent = cart.length;

// 3. RENDER PRODUCTS
function displayProducts(products) {
    if (products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><h3>No products found :(</h3></div>`;
        return;
    }
           container.innerHTML = products.map(product => `
                <div class="col-12 col-sm-6 col-md-6 col-lg-4">
                    <div class="product-card">
                        <div class="product-img-container">
                            <a href="details.html?id=${product.id}">
                            <img src="${product.image}" class="product-img" alt="${product.name}">
                            </a>
                            <div class="btn-wishlist" onclick="addToCart(${product.id})"><i class="bi bi-bag"></i></div>
                        </div>
                        <div class="p-2">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h3 class="product-title mb-0">${product.name}</h3>
                                <div class="text-end">
                                    <span class="product-price">$${product.price}</span>
                                    <span class="product-price-old">$${product.originalPrice}</span>
                                </div>
                            </div>
                            <p class="product-cat mb-2">${product.category}</p>
                            <div class="rating-stars">
                                <i class="bi bi-star-fill"></i>
                                <span class="text-dark fw-bold ms-1">${product.ratings}</span> <span class="rating-count">(${product.reviewCount})</span>
                            </div>
                        </div>
                    </div>
                </div>

            `).join('');
}

// 4. THE MASTER FILTER FUNCTION
function applyFilters() {
    let filtered = getProducts(); // Start with all products

    // A. FILTER BY SEARCH
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    // B. FILTER BY CATEGORY
    const activeCategories = [];
    if(document.getElementById('cat1').checked) activeCategories.push("Cardigans");
    if(document.getElementById('cat2').checked) activeCategories.push("Jackets");
    if(document.getElementById('cat3').checked) activeCategories.push("Dresses");
    if(document.getElementById('cat4').checked) activeCategories.push("Blazers");
    if(document.getElementById('cat5').checked) activeCategories.push("Shirts");
    if(document.getElementById('cat6').checked) activeCategories.push("T-Shirts");
    if(document.getElementById('cat7').checked) activeCategories.push("Sweaters");
    if(document.getElementById('cat8').checked) activeCategories.push("Coats");

    if (activeCategories.length > 0) {
        filtered = filtered.filter(p => activeCategories.includes(p.category));
    }

    // C. FILTER BY PRICE
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || 999999;

    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Render Result
    displayProducts(filtered);
}

// 5. EVENT LISTENERS (Run filter when user types or clicks)
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.querySelectorAll('.form-check-input').forEach(box => {
    box.addEventListener('change', applyFilters);
});
// Note: We don't add 'input' listener to price to avoid flashing while typing numbers. 
// The user must click "Apply Price" or we can add 'change' event if preferred.

// 6. ADD TO CART
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

    const product = allProducts.find(p => p.id === id);
    
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
    
    cart.push(product);
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    if(cartCount) cartCount.textContent = cart.length;
    showMessage('Item added to cart successfully!', 'success');
};

// Update wishlist count
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

// Initial Load
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCount();
});
displayProducts(allProducts);