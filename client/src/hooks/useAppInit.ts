import { useEffect, useState } from 'react';
import { mockFirestore } from '../services/mockFirebase';

export const useAppInit = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
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
              description: "Fresh blue flavored milk",
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
            }
          ];

          // Add mock products
          for (const product of mockProducts) {
            await mockFirestore.products.add(product);
          }
        }

        // Load initial orders
        const orders = await mockFirestore.orders.get();
        if (!orders.length) {
          // If no orders exist, initialize with mock data
          const mockOrders = [
            {
              customerId: "1",
              customerName: "Test Customer",
              customerEmail: "test@example.com",
              products: [
                {
                  sku: "8906036670090",
                  name: "Orange milk",
                  quantity: 2,
                  price: 27.0
                }
              ],
              total: 54.0,
              status: "pending",
              createdAt: new Date().toISOString()
            }
          ];

          // Add mock orders
          for (const order of mockOrders) {
            await mockFirestore.orders.add(order);
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error initializing mock data:', error);
      }
    };

    initializeMockData();
  }, []);

  return { initialized };
};
