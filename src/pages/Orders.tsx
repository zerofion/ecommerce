import { Box, Heading, VStack, HStack, Button, Container, FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import { Order, Product } from '../types';
import { mockFirestore } from '../services/mockFirebase';

export const Orders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    products: [],
    total: 0,
    status: 'pending',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await mockFirestore.orders.get();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadProducts = async () => {
    try {
      const data = await mockFirestore.products.get();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = () => {
    if (!selectedProducts.length) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const selected = products.filter(p => selectedProducts.includes(p.id));
    const newOrderProducts = [...newOrder.products, ...selected];
    
    setNewOrder(prev => ({
      ...prev,
      products: newOrderProducts,
      total: newOrderProducts.reduce((sum, p) => sum + (p.price || 0), 0),
    }));
    setSelectedProducts([]);

    toast({
      title: "Success",
      description: "Products added to order",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrder.customerName || !newOrder.customerEmail || !newOrder.products.length) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add products",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const order = {
        ...newOrder,
        customerId: Date.now().toString(),
      };

      if (editingOrder) {
        await mockFirestore.orders.update(editingOrder.id, order);
      } else {
        await mockFirestore.orders.add(order);
      }

      setNewOrder({
        customerName: '',
        customerEmail: '',
        products: [],
        total: 0,
        status: 'pending',
      });
      setSelectedProducts([]);
      setEditingOrder(null);
      
      toast({
        title: "Success",
        description: editingOrder ? "Order updated successfully" : "Order created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: editingOrder ? "Failed to update order" : "Failed to create order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setNewOrder(order);
  };

  const handleDelete = async (id: string) => {
    try {
      await mockFirestore.orders.delete(id);
      toast({
        title: "Success",
        description: "Order deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    try {
      await mockFirestore.orders.update(id, { status: newStatus });
      toast({
        title: "Success",
        description: "Order status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" mt={16}>
      <Heading mb={8}>Orders</Heading>

      <Box bg="white" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="customerName"
                value={newOrder.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Customer Email</FormLabel>
              <Input
                name="customerEmail"
                value={newOrder.customerEmail}
                onChange={handleInputChange}
                type="email"
                placeholder="Enter customer email"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Select Products</FormLabel>
              <Select
                value={selectedProducts}
                onChange={(e) => setSelectedProducts(e.target.value.split(','))}
                isMulti
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.price} Rs.)
                  </option>
                ))}
              </Select>
            </FormControl>

            <HStack>
              <Button
                onClick={handleAddProduct}
                colorScheme="primary"
                mr={2}
              >
                Add Products
              </Button>
              <Button type="submit" colorScheme="primary" w="full">
                {editingOrder ? "Update Order" : "Create Order"}
              </Button>
            </HStack>

            {newOrder.products.length > 0 && (
              <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Heading size="sm" mb={2}>Order Summary</Heading>
                <VStack spacing={2} align="stretch">
                  {newOrder.products.map((product, index) => (
                    <HStack key={index} justify="space-between">
                      <Text>{product.name}</Text>
                      <Text>${product.price}</Text>
                    </HStack>
                  ))}
                  <HStack justify="space-between" fontWeight="bold">
                    <Text>Total</Text>
                    <Text>${newOrder.total}</Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </form>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Order List</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Products</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>#{order.id}</Td>
                <Td>
                  <Text fontWeight="bold">{order.customerName}</Text>
                  <Text fontSize="sm" color="gray.600">{order.customerEmail}</Text>
                </Td>
                <Td>
                  {order.products.map((product, index) => (
                    <Text key={index} fontSize="sm">
                      {product.name} (${product.price})
                    </Text>
                  ))}
                </Td>
                <Td>${order.total}</Td>
                <Td>
                  <HStack spacing={1}>
                    {order.status === 'pending' && (
                      <>
                        <IconButton
                          aria-label="Deliver"
                          icon={<FaCheck color="green" />}
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          size="sm"
                        />
                        <IconButton
                          aria-label="Cancel"
                          icon={<FaTimes color="red" />}
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          size="sm"
                        />
                      </>
                    )}
                    {order.status === 'delivered' && (
                      <FaCheck color="green" />
                    )}
                    {order.status === 'cancelled' && (
                      <FaTimes color="red" />
                    )}
                  </HStack>
                </Td>
                <Td>
                  {new Date(order.createdAt).toLocaleDateString()} at
                  {new Date(order.createdAt).toLocaleTimeString()}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit"
                      icon={<FaEdit />}
                      onClick={() => handleEdit(order)}
                      colorScheme="blue"
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<FaTrash />}
                      onClick={() => handleDelete(order.id)}
                      colorScheme="red"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};
