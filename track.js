/* ============================================
   ORDER TRACKING JAVASCRIPT
   ============================================
   This file handles all the functionality for tracking orders:
   - Loading and displaying user orders
   - Searching for orders by ID
   - Creating visual order cards with progress tracking
   - Handling user interactions
*/

/* ============================================
   PAGE INITIALIZATION
   ============================================
   This runs when the page finishes loading (DOMContentLoaded event)
   It sets up all the event listeners and loads the initial data
*/
document.addEventListener('DOMContentLoaded', function() {
    // Update the navigation bar (show/hide login/logout, cart, etc.)
    updateNavigation();
    
    // Load and display all orders for the logged-in user
    loadUserOrders();
    
    // ============================================
    // LOGOUT FUNCTIONALITY
    // ============================================
    // When user clicks the logout link, log them out and redirect to login page
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();  // Prevent default link behavior
            logoutUser();         // Clear user session
            updateNavigation();   // Update navigation bar
            showMessage('Logged out successfully', 'success');
            // Redirect to login page after 1 second
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1000);
        });
    }

    // ============================================
    // ENTER KEY TO TRACK ORDER
    // ============================================
    // Allow users to press Enter in the order ID input to search
    const orderIdInput = document.getElementById('orderIdInput');
    if (orderIdInput) {
        orderIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackOrderById();  // Call the track function
            }
        });
    }
});

/* ============================================
   LOAD USER ORDERS
   ============================================
   This function loads all orders for the currently logged-in user
   and displays them on the page
*/
function loadUserOrders() {
    // Get the current logged-in user
    const currentUser = getCurrentUser();
    
    // If no user is logged in, show a message asking them to log in
    if (!currentUser) {
        document.getElementById('ordersContainer').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-lock"></i>
                <h3>Please log in to track your orders</h3>
                <p><a href="login.html" class="btn btn-primary mt-3">Login</a></p>
            </div>
        `;
        return;  // Stop here, don't continue
    }

    // Get all orders for this user's email address
    // This function comes from orders.js
    const orders = getOrdersByCustomer(currentUser.email);
    
    // If user has no orders, show a helpful message
    if (orders.length === 0) {
        document.getElementById('ordersContainer').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet. <a href="shop.html">Start shopping</a> to place your first order!</p>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    // This way the most recent orders appear at the top
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Display all the orders
    displayOrders(orders);
}

/* ============================================
   TRACK ORDER BY ID
   ============================================
   This function is called when user enters an order ID and clicks "Track Order"
   It finds that specific order and displays it
*/
function trackOrderById() {
    // Get the order ID from the input field
    const orderIdInput = document.getElementById('orderIdInput');
    const orderId = parseInt(orderIdInput.value);  // Convert to number

    // Validate: Check if order ID is valid
    if (!orderId || isNaN(orderId)) {
        showMessage('Please enter a valid order ID', 'warning');
        return;  // Stop if invalid
    }

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please log in to track orders', 'warning');
        // Redirect to login page after 1.5 seconds
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1500);
        return;
    }

    // Find the order by ID (function from orders.js)
    const order = getOrderById(orderId);
    
    // If order doesn't exist, show error
    if (!order) {
        showMessage(`Order #${orderId} not found`, 'error');
        return;
    }

    // Security check: Users can only view their own orders (unless admin)
    if (order.customerEmail !== currentUser.email && currentUser.role !== 'admin') {
        showMessage('You can only track your own orders', 'error');
        return;
    }

    // Display only this specific order
    displayOrders([order]);
    
    // Clear the input field
    orderIdInput.value = '';
    
    // Scroll smoothly to the order card so user can see it
    setTimeout(() => {
        document.querySelector('.order-card')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

/* ============================================
   DISPLAY ORDERS
   ============================================
   This function takes an array of orders and displays them on the page
   It creates the HTML structure for each order card
*/
function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    // If no orders, show empty state message
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h3>No orders found</h3>
            </div>
        `;
        return;
    }

    // Create a container div for all order cards
    container.innerHTML = '<div class="orders-list"></div>';
    const ordersList = container.querySelector('.orders-list');

    // Loop through each order and create a card for it
    orders.forEach(order => {
        const orderCard = createOrderCard(order);  // Create the HTML for this order
        ordersList.appendChild(orderCard);          // Add it to the page
    });
}

/* ============================================
   CREATE ORDER CARD
   ============================================
   This function creates the HTML structure for a single order card
   It includes: order header, progress tracker, and order items
*/
function createOrderCard(order) {
    // Create a new div element for the card
    const card = document.createElement('div');
    card.className = 'order-card';

    // Format the order date to be readable
    // Example: "Jan 15, 2024" instead of "2024-01-15T10:30:00Z"
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-US', { 
        year: 'numeric',   // 2024
        month: 'short',    // Jan
        day: 'numeric'     // 15
    });

    // Get the progress steps based on order status
    // This determines which steps are completed/active
    const statusSteps = getStatusSteps(order.status);

    // Create HTML for each item in the order
    // This loops through order.items and creates a list item for each product
    const itemsHTML = order.items.map(item => `
        <li>
            <div class="product-info">
                <img src="${item.productImage || 'https://via.placeholder.com/60'}" 
                     alt="${item.productName}" 
                     onerror="this.src='https://via.placeholder.com/60'">
                <div class="product-details">
                    <div class="product-name">${item.productName}</div>
                    <div class="product-quantity">Quantity: ${item.quantity}</div>
                </div>
            </div>
            <div class="item-price">${(item.price * item.quantity).toFixed(2)} EG</div>
        </li>
    `).join('');  // Join all items into one string

    // Build the complete HTML for the order card
    card.innerHTML = `
        <!-- Order Header: ID, Date, Status, Total -->
        <div class="order-header">
            <div class="order-header-left">
                <div class="order-id">Order #${order.id}</div>
                <div class="order-date">Placed on ${formattedDate}</div>
            </div>
            <div>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-total">${order.total.toFixed(2)} EG</div>
        </div>

        <!-- Progress Tracker: Visual steps showing order progress -->
        <div class="progress-track">
            ${statusSteps.map((step, index) => `
                <div class="step ${step.class}">
                    <div class="step-icon">${step.icon}</div>
                    <div class="step-label">${step.label}</div>
                </div>
            `).join('')}
        </div>

        <!-- Order Items: List of products in this order -->
        <div class="order-items">
            <h4><i class="bi bi-box-seam"></i> Order Items (${order.itemsCount} ${order.itemsCount === 1 ? 'item' : 'items'})</h4>
            <ul class="order-items-list">
                ${itemsHTML}
            </ul>
        </div>
    `;

    // Return the complete card element
    return card;
}

/* ============================================
   GET STATUS STEPS
   ============================================
   This function determines which progress steps should be:
   - completed (green with checkmark)
   - active (blue, current step)
   - pending (gray, not reached yet)
   
   Based on the order's current status
*/
function getStatusSteps(status) {
    // Define the 4 main steps in order processing
    const steps = [
        { label: 'Order Placed', class: '', icon: '1' },
        { label: 'Processing', class: '', icon: '2' },
        { label: 'Shipped', class: '', icon: '3' },
        { label: 'Delivered', class: '', icon: '4' }
    ];

    // Map each status to a step number (0-3)
    // -1 means cancelled (special case)
    const statusMap = {
        'pending': 0,        // Step 0: Order Placed
        'processing': 1,     // Step 1: Processing
        'shipped': 2,        // Step 2: Shipped
        'delivered': 3,     // Step 3: Delivered
        'completed': 3,     // Step 3: Delivered (same as delivered)
        'cancelled': -1     // Special: Cancelled orders
    };

    // Get the current step number for this status
    const currentStep = statusMap[status] || 0;

    // Special handling for cancelled orders
    if (status === 'cancelled') {
        // Show all steps with X icon (cancelled)
        return steps.map(step => ({ ...step, class: '', icon: '✕' }));
    }

    // Mark steps as completed or active
    for (let i = 0; i <= currentStep; i++) {
        if (i < currentStep) {
            // Steps before current are completed (green checkmark)
            steps[i].class = 'completed';
            steps[i].icon = '✓';
        } else {
            // Current step is active (blue, larger)
            steps[i].class = 'active';
        }
    }

    // Return the steps array with updated classes and icons
    return steps;
}

