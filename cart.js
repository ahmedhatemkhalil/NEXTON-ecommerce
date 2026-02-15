// 1. INITIALIZE
// We retrieve the raw array of products (e.g., [Shirt, Shirt, Shoes])
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];

// Update the nav cart count immediately (if element exists)
if (document.getElementById('cart-count')) {
document.getElementById('cart-count').textContent = cart.length;
}

const cartItemsContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('cart-subtotal');
const totalEl = document.getElementById('cart-total');

// 2. RENDER THE CART
function renderCart() {
    cartItemsContainer.innerHTML = ""; // Clear current display
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="bi bi-cart-x"></i>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items to your cart!</p>
                <a href="shop.html" class="btn btn-dark mt-3">Browse Products</a>
            </div>
        `;
        updateTotals(0);
        return;
    }

    // GROUP ITEMS: Convert [A, A, B] into { A: {qty:2, product:A}, B: {qty:1, product:B} }
    // This makes it easier to display "Quantity: 2"
    const groupedCart = {};
    
    cart.forEach(product => {
        if (groupedCart[product.id]) {
            groupedCart[product.id].qty += 1;
        } else {
            groupedCart[product.id] = {
                qty: 1,
                product: product
            };
        }
    });

    // GENERATE HTML FOR EACH GROUP
    let totalPrice = 0;

    Object.values(groupedCart).forEach(item => {
        const product = item.product;
        const qty = item.qty;
        const itemTotal = product.price * qty;
        totalPrice += itemTotal;

        // Get current stock from products.js (real-time stock check)
        let currentStock = product.stock || 0;
        if (typeof getProductById !== 'undefined') {
            const currentProduct = getProductById(product.id);
            if (currentProduct) {
                currentStock = currentProduct.stock || 0;
            }
        }

        // Determine stock status and max quantity
        const maxQty = Math.max(0, currentStock);
        const stockStatus = currentStock <= 0 ? 'out' : currentStock < 5 ? 'low' : 'available';
        const stockClass = `stock-${stockStatus}`;
        const stockText = currentStock <= 0 
            ? 'Out of Stock' 
            : currentStock < 5 
                ? `Low Stock (${currentStock} left)` 
                : `${currentStock} in stock`;

        // If current quantity exceeds stock, adjust it
        const displayQty = Math.min(qty, maxQty);

        const cartRow = document.createElement('div');
        cartRow.className = 'cart-item';
        cartRow.innerHTML = `
            <div class="item-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/120'">
            </div>
            <div class="item-details">
                <div class="item-header">
                    <h3 class="item-name">${product.name}</h3>
                    <p class="item-price">$${product.price.toFixed(2)} each</p>
                    <p class="item-stock ${stockClass}">
                        <i class="bi bi-${currentStock <= 0 ? 'x-circle' : currentStock < 5 ? 'exclamation-triangle' : 'check-circle'}"></i>
                        ${stockText}
                    </p>
                </div>
                <div class="qty-control">
                    <label>Quantity:</label>
                    <div class="qty-input-wrapper">
                        <button class="qty-btn" onclick="decreaseQuantity(${product.id})" ${displayQty <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" 
                               class="qty-input" 
                               value="${displayQty}" 
                               min="1" 
                               max="${maxQty}"
                               id="qty-${product.id}"
                               onchange="updateQuantity(${product.id}, this.value)"
                               oninput="validateQuantity(${product.id}, this.value, ${maxQty})">
                        <button class="qty-btn" onclick="increaseQuantity(${product.id}, ${maxQty})" ${displayQty >= maxQty ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${product.id})">
                        <i class="bi bi-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="item-total">
                <span class="item-total-label">Total</span>
                <span class="item-total-price">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
        cartItemsContainer.appendChild(cartRow);
    });

    updateTotals(totalPrice);
}

// 3. GET CURRENT STOCK FOR PRODUCT
function getCurrentStock(productId) {
    if (typeof getProductById !== 'undefined') {
        const product = getProductById(productId);
        return product ? (product.stock || 0) : 0;
    }
    // Fallback to product in cart
    const product = cart.find(p => p.id === productId);
    return product ? (product.stock || 0) : 0;
}

// 4. VALIDATE QUANTITY INPUT
window.validateQuantity = function(id, value, maxQty) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    
    let qty = parseInt(value) || 1;
    
    // Enforce limits
    if (qty < 1) {
        qty = 1;
        input.value = 1;
    } else if (qty > maxQty) {
        qty = maxQty;
        input.value = maxQty;
        showMessage(`Only ${maxQty} item(s) available in stock.`, 'warning');
    }
    
    // Update buttons
    const decreaseBtn = input.previousElementSibling;
    const increaseBtn = input.nextElementSibling;
    if (decreaseBtn) decreaseBtn.disabled = qty <= 1;
    if (increaseBtn) increaseBtn.disabled = qty >= maxQty;
};

// 5. INCREASE QUANTITY
window.increaseQuantity = function(id, maxQty) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    
    let currentQty = parseInt(input.value) || 1;
    const newQty = Math.min(currentQty + 1, maxQty);
    
    if (newQty > currentQty) {
        input.value = newQty;
        updateQuantity(id, newQty);
    } else if (newQty >= maxQty) {
        showMessage(`Only ${maxQty} item(s) available in stock.`, 'warning');
    }
};

// 6. DECREASE QUANTITY
window.decreaseQuantity = function(id) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    
    let currentQty = parseInt(input.value) || 1;
    const newQty = Math.max(1, currentQty - 1);
    
    if (newQty < currentQty) {
        input.value = newQty;
        updateQuantity(id, newQty);
    }
};

// 7. UPDATE QUANTITY LOGIC
window.updateQuantity = function(id, newQty) {
    newQty = parseInt(newQty) || 1;
    
    if (newQty < 1) {
        newQty = 1;
    }

    // Get current stock to validate
    const currentStock = getCurrentStock(id);
    if (newQty > currentStock) {
        newQty = Math.max(1, currentStock);
        showMessage(`Only ${currentStock} item(s) available in stock. Quantity adjusted.`, 'warning');
        
        // Update input field
        const input = document.getElementById(`qty-${id}`);
        if (input) {
            input.value = newQty;
        }
    }

    // To update quantity, we have to rebuild the raw cart array
    // 1. Remove ALL instances of this product
    const productToUpdate = cart.find(p => p.id === id);
    if (!productToUpdate) return;
    
    const otherProducts = cart.filter(p => p.id !== id);
    
    // 2. Add the product back 'newQty' times
    for(let i = 0; i < newQty; i++) {
        otherProducts.push(productToUpdate);
    }
    
    // 3. Save back to "State"
    cart = otherProducts;
    saveAndRefresh();
};

// 8. REMOVE ITEM LOGIC
window.removeItem = function(id) {
    const product = cart.find(p => p.id === id);
    const productName = product ? product.name : 'this item';
    
    // Filter out items with this ID
    cart = cart.filter(p => p.id !== id);
    saveAndRefresh();
    showMessage(`"${productName}" has been removed from your cart.`, 'success');
};

// 9. HELPER: SAVE TO LOCAL STORAGE & RE-RENDER
function saveAndRefresh() {
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    // Update cart count in all places
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = cart.length;
    });
    renderCart();
}

// 10. HELPER: UPDATE TOTALS DISPLAY
function updateTotals(total) {
    subtotalEl.textContent = `${total.toFixed(2)} $`;
    totalEl.textContent = `${total.toFixed(2)} $`;
}

// 11. CHECKOUT FUNCTIONALITY
window.proceedToCheckout = function() {
    // Check if cart is empty
    if (cart.length === 0) {
        showMessage('Your cart is empty. Please add items to your cart before checkout.', 'warning');
        return;
    }

    // Check if user is logged in
    const currentUser = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!currentUser) {
        showMessage('You need to be logged in to checkout. Redirecting to login page...', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return;
    }

    // Only customers can checkout (admins cannot)
    if (currentUser.role !== 'customer') {
        showMessage('Only customers can checkout. Admins cannot place orders.', 'error');
        return;
    }

    // Validate stock availability before checkout
    const groupedCart = {};
    cart.forEach(product => {
        if (groupedCart[product.id]) {
            groupedCart[product.id].qty += 1;
        } else {
            groupedCart[product.id] = {
                qty: 1,
                product: product
            };
        }
    });

    // Check stock for each item
    let stockError = null;
    Object.values(groupedCart).forEach(item => {
        if (typeof checkStock !== 'undefined') {
            const stockCheck = checkStock(item.product.id, item.qty);
            if (!stockCheck.available) {
                stockError = stockCheck.message;
            }
        }
    });

    if (stockError) {
        showMessage(`Stock Error: ${stockError}. Please update your cart and try again.`, 'error');
        renderCart(); // Refresh cart to show current stock
        return;
    }

    // Note: Checkout will proceed automatically after stock validation
    // The user can cancel by not clicking checkout if they change their mind

    // Calculate total
    let totalPrice = 0;
    Object.values(groupedCart).forEach(item => {
        totalPrice += item.product.price * item.qty;
    });

    // Process checkout (updates stock)
    if (typeof processCheckout !== 'undefined') {
        const checkoutResult = processCheckout(cart);
        if (!checkoutResult.success) {
            showMessage(`Checkout failed: ${checkoutResult.message}`, 'error');
            renderCart(); // Refresh cart
            return;
        }
    }

    // Create order
    if (typeof createOrder !== 'undefined') {
        const orderResult = createOrder(
            currentUser.email,
            currentUser.name,
            cart,
            totalPrice
        );

        if (orderResult.success) {
            // Clear cart
            cart = [];
            localStorage.setItem('nextonCart', JSON.stringify(cart));
            const cartCountElements = document.querySelectorAll('#cart-count');
            cartCountElements.forEach(el => {
                el.textContent = '0';
            });

            // Show success message with order details
            showMessage(`Order placed successfully! Order ID: #${orderResult.order.id} | Total: $${totalPrice.toFixed(2)}. Thank you for your purchase!`, 'success');

            // Redirect to home page after a delay
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);
        } else {
            showMessage(`Failed to create order: ${orderResult.message}`, 'error');
            renderCart(); // Refresh cart
        }
    } else {
        // Fallback if orders.js is not loaded
        showMessage('Order system not available. Please contact support.', 'error');
    }
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

// Initialize checkout button
// cart.js - Add this to your existing file

document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    // 1. Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please log in to complete your purchase.', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // 2. Get Cart Data
    const cart = JSON.parse(localStorage.getItem('nextonCart')) || [];
    
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }

    // 3. Calculate Total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // 4. Create Order (Using orders.js function)
    const result = createOrder(user.email, user.name, cart, total);

    if (result.success) {
        // 5. Clear Cart and Redirect
        localStorage.removeItem('nextonCart'); // Clear cart storage
        showMessage('Order placed successfully!', 'success');
        
        // Optional: Update stock (if using products.js features)
        // processCheckout(cart); 

        setTimeout(() => {
            window.location.href = 'track.html'; // Redirect to tracking page
        }, 1500);
    } else {
        showMessage('Failed to place order: ' + result.message, 'error');
    }
});

// Start
renderCart();