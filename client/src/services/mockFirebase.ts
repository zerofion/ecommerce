import { Product, Order } from '../types';

// Mock data store
const mockData = {
  products: [
    {
      id: 'prod_1',
      sku: "8906036670090",
      name: "Orange milk",
      description: "Fresh orange flavored milk",
      category: "dairy",
      price: 27.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 27.0,
      sellingPerQuantity: 27.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      sku: "8906036670014",
      name: "Blue milk",
      description: "Blueberry flavored milk",
      category: "dairy",
      price: 24.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 24.0,
      sellingPerQuantity: 24.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      sku: "8906036674739",
      name: "Green milk 200",
      description: "Green tea flavored milk",
      category: "dairy",
      price: 13.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 13.0,
      sellingPerQuantity: 13.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      sku: "8906036670205",
      name: "curd 200",
      description: "200ml curd",
      category: "dairy",
      price: 13.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 13.0,
      sellingPerQuantity: 13.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_5',
      sku: "8906036670212",
      name: "curd 500",
      description: "500ml curd",
      category: "dairy",
      price: 28.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 28.0,
      sellingPerQuantity: 28.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_6',
      sku: "8906036670977",
      name: "Nandini Paneer 200",
      description: "200g Nandini Paneer",
      category: "dairy",
      price: 99.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 100.0,
      sellingPerQuantity: 99.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_7',
      sku: "8904083300953",
      name: "Strawberry Milk Shake milky mist",
      description: "Strawberry flavored milk shake",
      category: "beverages",
      price: 40.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 40.0,
      sellingPerQuantity: 40.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_8',
      sku: "8904083300755",
      name: "Chocolate Milk Shake milky mist",
      description: "Chocolate flavored milk shake",
      category: "beverages",
      price: 40.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 40.0,
      sellingPerQuantity: 40.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_9',
      sku: "8904083309093",
      name: "Mango milk shake milky mist",
      description: "Mango flavored milk shake",
      category: "beverages",
      price: 30.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 30.0,
      sellingPerQuantity: 30.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_10',
      sku: "8906036674524",
      name: "Paneer Nandini old",
      description: "Nandini Paneer",
      category: "dairy",
      price: 100.0,
      stock: 0,
      imageUrl: "",
      mrpPerQuantity: 100.0,
      sellingPerQuantity: 100.0,
      paidCostPerQuantity: 0,
      allowLoose: false,
      minQuantity: 1,
      createdAt: new Date().toISOString()
    }
  ] as Product[],
  orders: [] as Order[],
  lastProductId: 10,
  lastOrderId: 0,
} as { products: Product[]; orders: Order[]; lastProductId: number; lastOrderId: number; };

interface AuthUser {
  email: string;
  role: 'customer' | 'vendor' | 'b2b-customer';
}

// Mock authentication
export const mockAuth = {
  currentUser: null as AuthUser | null,
  login: (email: string) => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (email) {
          mockAuth.currentUser = {
            email,
            role: 'customer', // Default role, can be updated based on actual implementation
          };
          resolve(true);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },
  logout: () => {
    mockAuth.currentUser = null;
  },
  updateRole: (role: 'customer' | 'vendor' | 'b2b-customer') => {
    if (mockAuth.currentUser) {
      mockAuth.currentUser.role = role;
    }
  },
};

// Mock Firestore
export const mockFirestore = {
  products: {
    get: async () => {
      return mockData.products;
    },
    add: async (product: Omit<Product, 'id' | 'createdAt'>) => {
      const newProduct = {
        ...product,
        id: `prod_${mockData.lastProductId}`,
        createdAt: new Date().toISOString()
      };
      mockData.products.push(newProduct);
      mockData.lastProductId += 1;
      return newProduct;
    },
    update: async (id: string, updates: Partial<Product>) => {
      const productIndex = mockData.products.findIndex(p => p.id === id);
      if (productIndex === -1) throw new Error('Product not found');
      mockData.products[productIndex] = {
        ...mockData.products[productIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return mockData.products[productIndex];
    },
    delete: async (id: string) => {
      const productIndex = mockData.products.findIndex(p => p.id === id);
      if (productIndex === -1) throw new Error('Product not found');
      mockData.products.splice(productIndex, 1);
    }
  },
  orders: {
    add: (order: Omit<Order, 'id' | 'createdAt'>) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const id = `order_${mockData.lastOrderId}`;
          const newOrder = { ...order, id, createdAt: new Date().toISOString() };
          mockData.orders = [...mockData.orders, newOrder];
          mockData.lastOrderId += 1;
          resolve(newOrder);
        }, 1000);
      });
    },
    get: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockData.orders]);
        }, 1000);
      });
    },
    update: (id: string, updates: Partial<Order>) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockData.orders = mockData.orders.map(order => 
            order.id === id ? { ...order, ...updates } : order
          );
          resolve(true);
        }, 1000);
      });
    },
  },
};

// Mock Realtime Database
export const mockRealtime = {
  onValue: (path: string, callback: (data: Product[] | Order[]) => void) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = path === 'products' ? mockData.products : mockData.orders;
        callback(data);
        resolve(() => {});
      }, 1000);
    });
  },
};

// Mock Storage
export const mockStorage = {
  ref: () => ({
    put: (file: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ downloadURL: `/images/${file.name}` });
        }, 1000);
      });
    },
  }),
  uploadFile: async (file: File) => {
    // In a real implementation, this would upload to Firebase Storage
    // For now, we'll just return a mock URL
    return Promise.resolve(`https://example.com/${file.name}`);
  },
  deleteFile: async (url: string) => {
    // In a real implementation, this would delete from Firebase Storage
    return Promise.resolve();
  }
};
