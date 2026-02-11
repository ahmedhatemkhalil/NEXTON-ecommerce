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
        cartItemsContainer.innerHTML = "<p>Your cart is empty. <a href='index.html'>Start shopping.</a></p>";
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

        const cartRow = document.createElement('div');
        cartRow.className = 'cart-item';
        cartRow.innerHTML = `
            <div class="item-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/100'">
            </div>
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toFixed(2)} EG</p>
                <div class="qty-control">
                    <label>Qty:</label>
                    <input type="number" value="${qty}" min="1" onchange="updateQuantity(${product.id}, this.value)">
                    <button class="remove-btn" onclick="removeItem(${product.id})">Remove</button>
                </div>
            </div>
            <div class="item-total">
                ${itemTotal.toFixed(2)} EG
            </div>
        `;
        cartItemsContainer.appendChild(cartRow);
    });

    updateTotals(totalPrice);
}

// 3. UPDATE QUANTITY LOGIC
window.updateQuantity = function(id, newQty) {
    newQty = parseInt(newQty);
    
    if (newQty < 1) return; // Prevent negative numbers

    // To update quantity, we have to rebuild the raw cart array
    // 1. Remove ALL instances of this product
    const productToUpdate = cart.find(p => p.id === id);
    const otherProducts = cart.filter(p => p.id !== id);
    
    // 2. Add the product back 'newQty' times
    for(let i = 0; i < newQty; i++) {
        otherProducts.push(productToUpdate);
    }
    
    // 3. Save back to "State"
    cart = otherProducts;
    saveAndRefresh();
};

// 4. REMOVE ITEM LOGIC
window.removeItem = function(id) {
    const product = cart.find(p => p.id === id);
    const productName = product ? product.name : 'this item';
    
    // Show confirmation toast with action
    if (confirm(`Are you sure you want to remove "${productName}" from your cart?`)) {
        // Filter out items with this ID
        cart = cart.filter(p => p.id !== id);
        saveAndRefresh();
        showMessage(`"${productName}" has been removed from your cart.`, 'success');
    }
};

// 5. HELPER: SAVE TO LOCAL STORAGE & RE-RENDER
function saveAndRefresh() {
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    // Update cart count in all places
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = cart.length;
    });
    renderCart();
}

// 6. HELPER: UPDATE TOTALS DISPLAY
function updateTotals(total) {
    subtotalEl.textContent = `${total.toFixed(2)} EG`;
    totalEl.textContent = `${total.toFixed(2)} EG`;
}

// 7. CHECKOUT FUNCTIONALITY
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

// Initialize checkout button
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

// Start
renderCart();