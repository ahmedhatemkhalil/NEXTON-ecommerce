// 1. UPDATE CART COUNT
let cart = JSON.parse(localStorage.getItem('nextonCart')) || [];
document.getElementById('cart-count').textContent = cart.length;

// 2. GET PRODUCT ID FROM URL
// This grabs the "?id=1" part from the address bar
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

const detailsContainer = document.getElementById('product-details');

// 3. FIND & RENDER PRODUCT
function loadProduct() {
    // Search the "database" (products.js) for the matching ID
    const product = products.find(p => p.id === productId);

    // Safety check: What if the ID doesn't exist?
    if (!product) {
        detailsContainer.innerHTML = "<h2>Product not found.</h2>";
        return;
    }

    // Render the details
    detailsContainer.innerHTML = `
        <div class="detail-image">
             <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500'">
        </div>
        
        <div class="detail-info">
            <p class="detail-category">${product.category}</p>
            <h1>${product.name}</h1>
            <p class="detail-price">${product.price.toFixed(2)} EG</p>
            
            <p class="detail-description">
                ${product.description}
                <br><br>
                <strong>Material:</strong> 100% Premium Cotton<br>
                <strong>Fit:</strong> Oversized / Boxy fit
            </p>

            <div class="action-area">
                <button onclick="addToCartDetailed(${product.id})" class="add-btn large-btn">ADD TO CART</button>
            </div>
        </div>
    `;
}

// 4. ADD TO CART LOGIC (Specific for this page)
window.addToCartDetailed = function(id) {
    const product = products.find(p => p.id === id);
    
    // Add to existing cart
    cart.push(product);
    
    // Save to LocalStorage
    localStorage.setItem('nextonCart', JSON.stringify(cart));
    
    // Update visual count
    document.getElementById('cart-count').textContent = cart.length;
    
    alert("Item added to cart successfully!");
};

// Start the loading process
loadProduct();