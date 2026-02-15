// products.js
// Product Management System using localStorage

// ============================================
// CONSTANTS
// ============================================
const PRICE_MARKUP = 1.2; // 20% markup for originalPrice calculation
const STORAGE_KEY = 'nexton_db';

// ============================================
// DEFAULT DATA
// ============================================
const defaultData = [
    {
        id: 1,
        name: "Mustard Oversized Overcoat",
        category: "Coats",
        price: 129.99,
        originalPrice: 159.99,
        description: "A bold mustard yellow overcoat with a relaxed fit. Perfect for layering over black turtlenecks for a sharp, modern look.",
        image: "resources/man1.png",
        stock: 15,
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Mustard Yellow", "Black"],
        ratings: 4.7,
        reviewCount: 85
    },
    {
        id: 2,
        name: "Soft Angora Knit Sweater",
        category: "Sweaters",
        price: 59.99,
        originalPrice: 79.99,
        description: "Ultra-soft white fuzzy knit sweater. Features a comfortable crew neck and cozy texture for chilly days.",
        image: "resources/woman1.png",
        stock: 42,
        sizes: ["S", "M", "L"],
        colors: ["White", "Cream"],
        ratings: 4.5,
        reviewCount: 150
    },
    {
        id: 3,
        name: "Statement Faux Fur Coat",
        category: "Jackets",
        price: 149.50,
        originalPrice: 199.99,
        description: "Turn heads with this luxurious purple faux fur coat. Soft to the touch with a glamorous, shaggy texture.",
        image: "resources/woman2.png",
        stock: 8,
        sizes: ["S", "M", "L"],
        colors: ["Purple", "Violet"],
        ratings: 4.6,
        reviewCount: 75
    },
    {
        id: 4,
        name: "Essential White Tee",
        category: "T-Shirts",
        price: 24.99,
        originalPrice: 29.99,
        description: "The perfect everyday white t-shirt. Breathable cotton blend with a relaxed fit and rolled sleeves.",
        image: "resources/woman3.png",
        stock: 100,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White"],
        ratings: 4.7,
        reviewCount: 200
    },
    {
        id: 5,
        name: "Classic Oxford Button-Down",
        category: "Shirts",
        price: 49.99,
        originalPrice: 59.99,
        description: "Crisp white formal shirt with a structured collar. Ideal for office wear or a smart-casual look paired with trousers.",
        image: "resources/woman4.png",
        stock: 30,
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Light Blue"],
        ratings: 4.5,
        reviewCount: 120
    },
    {
        id: 6,
        name: "Boho Fringe Cardigan",
        category: "Cardigans",
        price: 65.00,
        originalPrice: 79.99,
        description: "Relaxed fit cardigan with fringe details. The perfect layering piece for a bohemian, laid-back style.",
        image: "resources/woman5.png",
        stock: 25,
        sizes: ["One Size"],
        colors: ["Cream", "Beige"],
        ratings: 4.2,
        reviewCount: 95
    },
    {
        id: 7,
        name: "Vintage Wash Denim Jacket",
        category: "Jackets",
        price: 79.99,
        originalPrice: 99.99,
        description: "Classic blue denim jacket with distressed details and a graphic print lining. A timeless wardrobe staple.",
        image: "resources/woman6.png",
        stock: 18,
        sizes: ["S", "M", "L", "XL"],
        colors: ["Blue Denim"],
        ratings: 4.5,
        reviewCount: 150
    },
    {
        id: 8,
        name: "Midnight Lace Party Dress",
        category: "Dresses",
        price: 89.99,
        originalPrice: 109.99,
        description: "Elegant black lace dress with a collared neck and sheer details. Perfect for evening events and parties.",
        image: "resources/woman7.png",
        stock: 12,
        sizes: ["XS", "S", "M"],
        colors: ["Black"],
        ratings: 4.8,
        reviewCount: 85
    },
    {
        id: 9,
        name: "Belted City Blazer",
        category: "Blazers",
        price: 110.00,
        originalPrice: 139.99,
        description: "Sophisticated black blazer with a waist belt to define the silhouette. detailed with gold hardware for a premium finish.",
        image: "resources/woman8.png",
        stock: 20,
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy"],
        ratings: 4.5,
        reviewCount: 120
    }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique product ID
 * @returns {number} Next available product ID
 */
function generateProductId() {
    const products = getProducts();
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

/**
 * Get all products from localStorage
 * Initializes with default data if localStorage is empty
 * @returns {Array} Array of product objects
 */
function getProducts() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with default data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    } catch (error) {
        console.error('Error reading products from localStorage:', error);
        // Return default data if there's an error
        return defaultData;
    }
}

/**
 * Save products to localStorage
 * @param {Array} products - Array of product objects to save
 * @returns {boolean} Success status
 */
function saveToDb(products) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return true;
    } catch (error) {
        console.error('Error saving products to localStorage:', error);
        return false;
    }
}

/**
 * Validate product data
 * @param {Object} product - Product object to validate
 * @param {boolean} isUpdate - Whether this is an update (allows missing optional fields)
 * @returns {Object} { valid: boolean, message: string }
 */
function validateProduct(product, isUpdate = false) {
    // Required fields
    if (!isUpdate && (!product.name || product.name.trim() === '')) {
        return { valid: false, message: 'Product name is required' };
    }

    if (!isUpdate && (!product.category || product.category.trim() === '')) {
        return { valid: false, message: 'Product category is required' };
    }

    if (product.price !== undefined) {
        const price = parseFloat(product.price);
        if (isNaN(price) || price <= 0) {
            return { valid: false, message: 'Price must be a positive number' };
        }
    }

    if (product.stock !== undefined) {
        const stock = parseInt(product.stock);
        if (isNaN(stock) || stock < 0) {
            return { valid: false, message: 'Stock must be a non-negative integer' };
        }
    }

    if (product.image && !isValidUrl(product.image)) {
        return { valid: false, message: 'Image must be a valid URL' };
    }

    return { valid: true, message: 'Product is valid' };
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL string to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        // Also accept relative paths
        return url.startsWith('/') || url.startsWith('./') || url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg');
    }
}

/**
 * Check if a product with the same name already exists
 * @param {string} name - Product name to check
 * @param {number} excludeId - Product ID to exclude from check (for updates)
 * @returns {boolean}
 */
function isDuplicateProduct(name, excludeId = null) {
    const products = getProducts();
    return products.some(p => 
        p.name.toLowerCase().trim() === name.toLowerCase().trim() && 
        p.id !== excludeId
    );
}

/**
 * Calculate original price based on current price
 * @param {number} price - Current price
 * @returns {number} Original price with markup
 */
function calculateOriginalPrice(price) {
    return parseFloat((parseFloat(price) * PRICE_MARKUP).toFixed(2));
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Add a new product
 * @param {string} name - Product name
 * @param {string} category - Product category
 * @param {number} price - Product price
 * @param {string} image - Product image URL
 * @param {string} description - Product description
 * @param {number} stock - Stock quantity (default: 0)
 * @param {Array} sizes - Available sizes (default: [])
 * @param {Array} colors - Available colors (default: [])
 * @param {number} originalPrice - Original price (optional, will be calculated if not provided)
 * @returns {Object} { success: boolean, message: string, product?: Object }
 */
function addProduct(name, category, price, image, description, stock = 0, sizes = [], colors = [], originalPrice = null) {
    // Validate inputs
    const product = {
        name: name?.trim(),
        category: category?.trim(),
        price: parseFloat(price),
        image: image?.trim(),
        description: description?.trim() || '',
        stock: parseInt(stock) || 0,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : []
    };

    const validation = validateProduct(product);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }

    // Check for duplicates

if (isDuplicateProduct(
        product.name,
        product.category,
        product.colors,
        product.sizes
    )) {
    return { success: false, message: 'A product with this name, category, colors, and sizes already exists' };
}



    try {
        const products = getProducts();
        const newProduct = {
            id: generateProductId(),
            name: product.name,
            category: product.category,
            price: product.price,
            originalPrice: originalPrice ? parseFloat(originalPrice) : calculateOriginalPrice(product.price),
            image: product.image,
            description: product.description,
            stock: product.stock,
            sizes: product.sizes,
            colors: product.colors,
            ratings: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString()
        };

        products.push(newProduct);
        const saved = saveToDb(products);

        if (saved) {
            return { success: true, message: 'Product added successfully', product: newProduct };
        } else {
            return { success: false, message: 'Failed to save product' };
        }
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, message: 'An error occurred while adding the product' };
    }
}

/**
 * Update an existing product
 * @param {number} id - Product ID
 * @param {string} name - Product name
 * @param {string} category - Product category
 * @param {number} price - Product price
 * @param {string} image - Product image URL
 * @param {string} description - Product description
 * @param {number} stock - Stock quantity
 * @param {Array} sizes - Available sizes (optional)
 * @param {Array} colors - Available colors (optional)
 * @param {number} originalPrice - Original price (optional)
 * @returns {Object} { success: boolean, message: string, product?: Object }
 */
function updateProduct(id, name, category, price, image, description, stock, sizes = null, colors = null, originalPrice = null) {
    try {
        const products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return { success: false, message: 'Product not found' };
        }

        const existingProduct = products[index];
        
        // Prepare update data (only update provided fields)
        const updateData = {
            name: name !== undefined ? name.trim() : existingProduct.name,
            category: category !== undefined ? category.trim() : existingProduct.category,
            price: price !== undefined ? parseFloat(price) : existingProduct.price,
            image: image !== undefined ? image.trim() : existingProduct.image,
            description: description !== undefined ? description.trim() : existingProduct.description,
            stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
            sizes: sizes !== null ? (Array.isArray(sizes) ? sizes : []) : existingProduct.sizes,
            colors: colors !== null ? (Array.isArray(colors) ? colors : []) : existingProduct.colors
        };

        // Validate updated product
        const validation = validateProduct(updateData, true);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Check for duplicate name (excluding current product)
       if (updateData.name !== existingProduct.name || updateData.category !== existingProduct.category) {
if (isDuplicateProduct(
        updateData.name,
        updateData.category,
        updateData.colors,
        updateData.sizes,
        id
    )) {
    return { success: false, message: 'A product with this name, category, colors, and sizes already exists' };
}

}


        // Update product
        products[index] = {
            ...existingProduct,
            ...updateData,
            originalPrice: originalPrice !== null ? parseFloat(originalPrice) : calculateOriginalPrice(updateData.price),
            updatedAt: new Date().toISOString()
        };

        const saved = saveToDb(products);

        if (saved) {
            return { success: true, message: 'Product updated successfully', product: products[index] };
        } else {
            return { success: false, message: 'Failed to save product' };
        }
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, message: 'An error occurred while updating the product' };
    }
}

/**
 * Delete a product by ID
 * @param {number} id - Product ID to delete
 * @returns {Object} { success: boolean, message: string }
 */
function deleteProduct(id) {
    try {
        const products = getProducts();
        const initialLength = products.length;
        const filteredProducts = products.filter(p => p.id !== id);

        if (filteredProducts.length === initialLength) {
            return { success: false, message: 'Product not found' };
        }

        const saved = saveToDb(filteredProducts);

        if (saved) {
            return { success: true, message: 'Product deleted successfully' };
        } else {
            return { success: false, message: 'Failed to delete product' };
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, message: 'An error occurred while deleting the product' };
    }
}

/**
 * Get a product by ID
 * @param {number} id - Product ID
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(id) {
    try {
        const products = getProducts();
        return products.find(p => p.id === id) || null;
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
}

// ============================================
// SEARCH AND FILTER FUNCTIONS
// ============================================

/**
 * Search products by name or description
 * @param {string} query - Search query
 * @returns {Array} Array of matching products
 */
function searchProducts(query) {
    if (!query || query.trim() === '') {
        return getProducts();
    }

    try {
        const products = getProducts();
        const searchTerm = query.toLowerCase().trim();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

/**
 * Filter products by category
 * @param {string} category - Category to filter by
 * @returns {Array} Array of products in the category
 */
function filterByCategory(category) {
    if (!category || category.trim() === '') {
        return getProducts();
    }

    try {
        const products = getProducts();
        return products.filter(p => p.category.toLowerCase() === category.toLowerCase().trim());
    } catch (error) {
        console.error('Error filtering products by category:', error);
        return [];
    }
}

/**
 * Get all unique categories
 * @returns {Array} Array of unique category names
 */
function getAllCategories() {
    try {
        const products = getProducts();
        const categories = [...new Set(products.map(p => p.category))];
        return categories.sort();
    } catch (error) {
        console.error('Error getting categories:', error);
        return [];
    }
}

// ============================================
// STOCK MANAGEMENT
// ============================================

/**
 * Update product stock quantity
 * @param {number} id - Product ID
 * @param {number} quantity - New stock quantity
 * @returns {Object} { success: boolean, message: string, product?: Object }
 */
function updateStock(id, quantity) {
    try {
        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
            return { success: false, message: 'Stock quantity must be a non-negative integer' };
        }

        const products = getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return { success: false, message: 'Product not found' };
        }

        products[index].stock = quantityNum;
        products[index].updatedAt = new Date().toISOString();

        const saved = saveToDb(products);

        if (saved) {
            return { success: true, message: 'Stock updated successfully', product: products[index] };
        } else {
            return { success: false, message: 'Failed to update stock' };
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, message: 'An error occurred while updating stock' };
    }
}

/**
 * Check if product has sufficient stock
 * @param {number} id - Product ID
 * @param {number} quantity - Required quantity
 * @returns {Object} { available: boolean, stock: number, message: string }
 */
function checkStock(id, quantity) {
    try {
        const product = getProductById(id);
        if (!product) {
            return { available: false, stock: 0, message: 'Product not found' };
        }

        const requiredQty = parseInt(quantity) || 1;
        const available = product.stock >= requiredQty;

        return {
            available,
            stock: product.stock,
            message: available 
                ? `Stock available: ${product.stock} units` 
                : `Insufficient stock. Only ${product.stock} units available`
        };
    } catch (error) {
        console.error('Error checking stock:', error);
        return { available: false, stock: 0, message: 'Error checking stock' };
    }
}

// ============================================
// CHECKOUT LOGIC
// ============================================

/**
 * Process checkout and update stock
 * @param {Array} cartItems - Array of cart items with id property
 * @returns {Object} { success: boolean, message: string }
 */
function processCheckout(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { success: false, message: 'Cart is empty' };
    }

    try {
        const dbProducts = getProducts();
        
        // Count quantities needed
        const needed = {};
        cartItems.forEach(item => {
            const id = parseInt(item.id);
            if (!isNaN(id)) {
                needed[id] = (needed[id] || 0) + 1;
            }
        });

        // Validate Stock
        for (const [id, qty] of Object.entries(needed)) {
            const productId = parseInt(id);
            const product = dbProducts.find(p => p.id === productId);
            
            if (!product) {
                return { 
                    success: false, 
                    message: `Product with ID ${id} not found` 
                };
            }
            
            if (product.stock < qty) {
                return { 
                    success: false, 
                    message: `Stock Error: "${product.name}" only has ${product.stock} left, but ${qty} requested.` 
                };
            }
        }

        // Decrement Stock
        for (const [id, qty] of Object.entries(needed)) {
            const productId = parseInt(id);
            const product = dbProducts.find(p => p.id === productId);
            if (product) {
                product.stock -= qty;
                product.updatedAt = new Date().toISOString();
            }
        }

        const saved = saveToDb(dbProducts);
        
        if (saved) {
            return { success: true, message: 'Checkout processed successfully' };
        } else {
            return { success: false, message: 'Failed to save stock changes' };
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        return { success: false, message: 'An error occurred during checkout' };
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Reset all products to default data
 * WARNING: This will delete all custom products
 * @returns {boolean} Success status
 */
function factoryReset() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        // Initialize with default data
        getProducts();
        return true;
    } catch (error) {
        console.error('Error resetting products:', error);
        return false;
    }
}

/**
 * Get total number of products
 * @returns {number} Total product count
 */
function getProductCount() {
    return getProducts().length;
}

/**
 * Get products with low stock (below threshold)
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Array} Array of products with low stock
 */
function getLowStockProducts(threshold = 10) {
    try {
        const products = getProducts();
        return products.filter(p => p.stock < threshold);
    } catch (error) {
        console.error('Error getting low stock products:', error);
        return [];
    }
}

// validtion functions
//1- prevent duplicate product based on name, category, colors, and sizes
function isDuplicateProduct(name, category, colors = [], sizes = [], excludeId = null) {
    const products = getProducts();
    return products.some(p => 
        p.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        p.category.toLowerCase().trim() === category.toLowerCase().trim() &&
        JSON.stringify((p.colors || []).slice().sort()) === JSON.stringify((colors || []).slice().sort()) &&
        JSON.stringify((p.sizes || []).slice().sort()) === JSON.stringify((sizes || []).slice().sort()) &&
        p.id !== excludeId
    );
}

