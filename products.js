// products.js

// 1. DEFAULT DATA
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

// 2. HELPERS
function getProducts() {
    const stored = localStorage.getItem('nexton_db');
    return stored ? JSON.parse(stored) : (localStorage.setItem('nexton_db', JSON.stringify(defaultData)), defaultData);
}

function saveToDb(data) {
    localStorage.setItem('nexton_db', JSON.stringify(data));
}

// --- DYNAMIC FUNCTIONS ---

// CREATE
function addProduct(name, category, price, image, description) {
    const products = getProducts();
    products.push({
        id: Date.now(),
        name, category, price: parseFloat(price),
        originalPrice: (parseFloat(price) * 1.2).toFixed(2),
        image, description, ratings: 0, reviewCount: 0
    });
    saveToDb(products);
}

// UPDATE (New Function)
function updateProduct(id, name, category, price, image, description, stock) {
    let products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name, category, price: parseFloat(price),
            originalPrice: (parseFloat(price) * 1.2).toFixed(2),
            image, description,
            stock: parseInt(stock) || 0
        };
        saveToDb(products);
    }
}

function deleteProduct(id) {
    let products = getProducts().filter(p => p.id !== id);
    saveToDb(products);
}

// 4. CHECKOUT LOGIC (The "Pay" Function)
function processCheckout(cartItems) {
    const dbProducts = getProducts();
    
    // Count quantities needed
    const needed = {};
    cartItems.forEach(item => {
        needed[item.id] = (needed[item.id] || 0) + 1;
    });

    // Validate Stock
    for (const [id, qty] of Object.entries(needed)) {
        const product = dbProducts.find(p => p.id == id);
        if (!product || product.stock < qty) {
            return { 
                success: false, 
                message: `Stock Error: "${product ? product.name : 'Item'}" only has ${product ? product.stock : 0} left.` 
            };
        }
    }

    // Decrement Stock
    for (const [id, qty] of Object.entries(needed)) {
        const product = dbProducts.find(p => p.id == id);
        product.stock -= qty;
    }

    saveToDb(dbProducts);
    return { success: true };
}
function factoryReset() {
    localStorage.removeItem('nexton_db');
    location.reload();
}