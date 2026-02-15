// orders.js
// Order Management System using localStorage

// ============================================
// CONSTANTS
// ============================================
const ORDERS_STORAGE_KEY = 'nexton_orders';

// ============================================
// ORDER MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get all orders from localStorage
 * @returns {Array} Array of order objects
 */
function getAllOrders() {
    try {
        const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (ordersJson) {
            return JSON.parse(ordersJson);
        }
        return [];
    } catch (error) {
        console.error('Error reading orders from localStorage:', error);
        return [];
    }
}

/**
 * Save orders to localStorage
 * @param {Array} orders - Array of order objects
 * @returns {boolean} Success status
 */
function saveOrders(orders) {
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Error saving orders to localStorage:', error);
        return false;
    }
}

/**
 * Generate a unique order ID
 * @returns {number} Next available order ID
 */
function generateOrderId() {
    const orders = getAllOrders();
    if (orders.length === 0) return 1;
    return Math.max(...orders.map(o => o.id)) + 1;
}

/**
 * Create a new order
 * @param {string} customerEmail - Customer email address
 * @param {string} customerName - Customer name
 * @param {Array} items - Array of cart items (products)
 * @param {number} total - Total order amount
 * @returns {Object} { success: boolean, message: string, order?: Object }
 */
function createOrder(customerEmail, customerName, items, total) {
    try {
        if (!customerEmail || !customerName) {
            return { success: false, message: 'Customer information is required' };
        }

        if (!Array.isArray(items) || items.length === 0) {
            return { success: false, message: 'Order must contain at least one item' };
        }

        if (!total || total <= 0) {
            return { success: false, message: 'Invalid order total' };
        }

        // Group items by product ID to get quantities
        const itemGroups = {};
        items.forEach(item => {
            const id = parseInt(item.id);
            if (!isNaN(id)) {
                if (itemGroups[id]) {
                    itemGroups[id].quantity += 1;
                } else {
                    itemGroups[id] = {
                        productId: id,
                        productName: item.name || 'Unknown Product',
                        productImage: item.image || '',
                        price: parseFloat(item.price) || 0,
                        quantity: 1
                    };
                }
            }
        });

        // Create order object
        const order = {
            id: generateOrderId(),
            customerEmail: customerEmail,
            customerName: customerName,
            items: Object.values(itemGroups),
            itemsCount: items.length,
            total: parseFloat(total),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save order
        const orders = getAllOrders();
        orders.push(order);
        const saved = saveOrders(orders);

        if (saved) {
            return { success: true, message: 'Order created successfully', order: order };
        } else {
            return { success: false, message: 'Failed to save order' };
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, message: 'An error occurred while creating the order' };
    }
}

/**
 * Get orders by customer email
 * @param {string} email - Customer email
 * @returns {Array} Array of orders for the customer
 */
function getOrdersByCustomer(email) {
    try {
        const orders = getAllOrders();
        return orders.filter(order => order.customerEmail === email);
    } catch (error) {
        console.error('Error getting orders by customer:', error);
        return [];
    }
}

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Object|null} Order object or null if not found
 */
function getOrderById(orderId) {
    try {
        const orders = getAllOrders();
        return orders.find(order => order.id === orderId) || null;
    } catch (error) {
        console.error('Error getting order by ID:', error);
        return null;
    }
}

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status (pending, processing, shipped, delivered, completed, cancelled)
 * @returns {Object} { success: boolean, message: string, order?: Object }
 */
function updateOrderStatus(orderId, status) {
    try {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return { success: false, message: 'Invalid order status' };
        }

        const orders = getAllOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) {
            return { success: false, message: 'Order not found' };
        }

        // Prevent deletion of completed orders
        if (orders[orderIndex].status === 'completed' && status === 'cancelled') {
            return { success: false, message: 'Cannot cancel a completed order' };
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();

        const saved = saveOrders(orders);

        if (saved) {
            return { success: true, message: 'Order status updated successfully', order: orders[orderIndex] };
        } else {
            return { success: false, message: 'Failed to update order status' };
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, message: 'An error occurred while updating order status' };
    }
}

/**
 * Delete an order (only if not completed)
 * @param {number} orderId - Order ID
 * @returns {Object} { success: boolean, message: string }
 */
function deleteOrder(orderId) {
    try {
        const orders = getAllOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) {
            return { success: false, message: 'Order not found' };
        }

        // Protect completed orders from deletion
        if (orders[orderIndex].status === 'completed') {
            return { success: false, message: 'Cannot delete a completed order' };
        }

        orders.splice(orderIndex, 1);
        const saved = saveOrders(orders);

        if (saved) {
            return { success: true, message: 'Order deleted successfully' };
        } else {
            return { success: false, message: 'Failed to delete order' };
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, message: 'An error occurred while deleting the order' };
    }
}

/**
 * Get total number of orders
 * @returns {number} Total order count
 */
function getOrderCount() {
    return getAllOrders().length;
}

/**
 * Get orders filtered by status
 * @param {string} status - Order status to filter by
 * @returns {Array} Array of orders with the specified status
 */
function getOrdersByStatus(status) {
    try {
        const orders = getAllOrders();
        return orders.filter(order => order.status === status);
    } catch (error) {
        console.error('Error getting orders by status:', error);
        return [];
    }
}

