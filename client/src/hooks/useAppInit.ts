import { useEffect } from 'react';
import { mockFirestore } from '../services/mockFirebase';

export const useAppInit = () => {
  useEffect(() => {
    // Initialize mock data
    const initializeMockData = async () => {
      try {
        // Load initial products
        const products = await mockFirestore.products.get();
        if (!products.length) {
          // If no products exist, initialize with mock data
          const mockProducts = [
            {
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
            }
          ];

          // Add mock products
          for (const product of mockProducts) {
            await mockFirestore.products.add(product);
          }
        }
      } catch (error) {
        console.error('Error initializing mock data:', error);
      }
    };

    initializeMockData();
  }, []);
};
