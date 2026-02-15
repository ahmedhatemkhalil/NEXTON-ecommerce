// track.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication
    const user = getCurrentUser();
    if (!user) {
        document.getElementById('ordersContainer').innerHTML = `
            <div class="empty-state text-center py-5">
                <i class="bi bi-person-lock fs-1 mb-3"></i>
                <h3>Please Log In</h3>
                <p>You need to be logged in to view your order history.</p>
                <a href="login.html" class="btn btn-primary mt-3">Login Now</a>
            </div>
        `;
        return;
    }

    // 2. Load User's Orders
    loadUserOrders(user.email);
});

function loadUserOrders(email) {
    const container = document.getElementById('ordersContainer');
    
    // Get orders using the function from orders.js
    const myOrders = getOrdersByCustomer(email);

    // Sort by newest first
    myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet.</p>
                <a href="shop.html" class="btn btn-outline-primary mt-3">Start Shopping</a>
            </div>
        `;
        return;
    }

    // 3. Render Orders
    container.innerHTML = myOrders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const status = order.status || 'pending';
        
        // Calculate Progress for the visual stepper
        let progressWidth = '0%';
        if (status === 'processing') progressWidth = '25%';
        else if (status === 'shipped') progressWidth = '50%';
        else if (status === 'delivered') progressWidth = '75%';
        else if (status === 'completed') progressWidth = '100%';
        
        // Status Badge Color (matches Admin Dashboard)
        let statusBadgeClass = 'bg-warning text-dark'; // default pending
        if (status === 'processing') statusBadgeClass = 'bg-info text-dark';
        if (status === 'shipped') statusBadgeClass = 'bg-primary';
        if (status === 'delivered') statusBadgeClass = 'bg-success';
        if (status === 'completed') statusBadgeClass = 'bg-success';
        if (status === 'cancelled') statusBadgeClass = 'bg-danger';

        return `
            <div class="card mb-4 shadow-sm border-0">
                <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h5 class="mb-0 fw-bold">Order #${order.id}</h5>
                        <small class="text-muted">Placed on ${date}</small>
                    </div>
                    <span class="badge ${statusBadgeClass} fs-6 px-3 py-2 rounded-pill text-capitalize">
                        ${status}
                    </span>
                </div>
                <div class="card-body">
                    ${status !== 'cancelled' ? `
                    <div class="position-relative mb-5 mt-3 mx-4">
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${progressWidth}"></div>
                        </div>
                        <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
                            <span class="d-flex flex-column align-items-center" style="margin-top: -10px;">
                                <i class="bi bi-clipboard-check fs-4 text-success bg-white px-1"></i>
                                <small class="mt-1 fw-bold">Pending</small>
                            </span>
                            <span class="d-flex flex-column align-items-center" style="margin-top: -10px;">
                                <i class="bi bi-box-seam fs-4 ${['processing', 'shipped', 'delivered', 'completed'].includes(status) ? 'text-success' : 'text-muted'} bg-white px-1"></i>
                                <small class="mt-1">Processing</small>
                            </span>
                            <span class="d-flex flex-column align-items-center" style="margin-top: -10px;">
                                <i class="bi bi-truck fs-4 ${['shipped', 'delivered', 'completed'].includes(status) ? 'text-success' : 'text-muted'} bg-white px-1"></i>
                                <small class="mt-1">Shipped</small>
                            </span>
                             <span class="d-flex flex-column align-items-center" style="margin-top: -10px;">
                                <i class="bi bi-check-circle fs-4 ${['delivered', 'completed'].includes(status) ? 'text-success' : 'text-muted'} bg-white px-1"></i>
                                <small class="mt-1">Delivered</small>
                            </span>
                        </div>
                    </div>
                    ` : '<div class="alert alert-danger">This order has been cancelled.</div>'}

                    <div class="table-responsive mt-4">
                        <table class="table align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${item.productImage}" alt="${item.productName}" 
                                                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px;">
                                                <span class="fw-medium">${item.productName}</span>
                                            </div>
                                        </td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>x${item.quantity}</td>
                                        <td class="text-end">$${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot class="border-top">
                                <tr>
                                    <td colspan="3" class="text-end fw-bold pt-3">Order Total:</td>
                                    <td class="text-end fw-bold fs-5 pt-3 text-primary">$${order.total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Optional: Search functionality
function trackOrderById() {
    const searchId = document.getElementById('orderIdInput').value;
    if (!searchId) {
        const user = getCurrentUser();
        if(user) loadUserOrders(user.email); // Reset to showing all
        return;
    }

    const order = getOrderById(parseInt(searchId));
    const user = getCurrentUser();

    // Only show if it belongs to the logged-in user
    if (order && user && order.customerEmail === user.email) {
        // Manually trigger render for single item array
        const container = document.getElementById('ordersContainer');
        // We reuse the logic by temporarily mocking the array
        // (For cleaner code, you could refactor render logic into a separate function, 
        // but this works for now if you copy the rendering part above).
        alert(`Order #${order.id} found! Status: ${order.status}`);
        // Ideally, call the render function with [order]
    } else {
        alert('Order not found or does not belong to your account.');
    }
}