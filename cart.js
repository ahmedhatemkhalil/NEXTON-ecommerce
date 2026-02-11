// 1. INITIALIZE
// We retrieve the raw array of products (e.g., [Shirt, Shirt, Shoes])
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];

// Update the nav cart count immediately
document.getElementById('cart-count').textContent = cart.length;

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
    if(confirm("Are you sure you want to remove this item?")) {
        // Filter out items with this ID
        cart = cart.filter(p => p.id !== id);
        saveAndRefresh();
    }
};

// 5. HELPER: SAVE TO LOCAL STORAGE & RE-RENDER
function saveAndRefresh() {
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    document.getElementById('cart-count').textContent = cart.length;
    renderCart();
}

// 6. HELPER: UPDATE TOTALS DISPLAY
function updateTotals(total) {
    subtotalEl.textContent = `${total.toFixed(2)} EG`;
    totalEl.textContent = `${total.toFixed(2)} EG`;
}

// Start
renderCart();