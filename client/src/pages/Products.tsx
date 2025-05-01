import { Box, Heading, VStack, HStack, Button, Container, FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton, Spinner, Image } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { mockFirestore, mockStorage } from '../services/mockFirebase';
import { Product } from '../types';

export const Products = () => {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    mrpPerQuantity: 0,
    sellingPerQuantity: 0,
    paidCostPerQuantity: 0,
    allowLoose: false,
    minQuantity: 1,
    createdAt: new Date().toISOString()
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Initialize mock data when component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await mockFirestore.products.get();
      console.log('Loaded products from mock:', data);
      
      // Ensure we have an array of products
      if (Array.isArray(data)) {
        console.log('Setting products state with:', data);
        setProducts([...data]); // Create a new array instance
        console.log('Products state after set:', products);
      } else {
        console.error('Invalid data format:', data);
        setProducts([]); // Set empty array if data is invalid
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setProducts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [setProducts, toast]);

  // Add a useEffect to log state changes
  useEffect(() => {
    console.log('Current products state:', products);
  }, [products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev: Product) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (selectedImage) {
        const storageResult = await mockStorage.ref('products').put(selectedImage);
        newProduct.imageUrl = storageResult.downloadURL;
      }

      if (editingProduct) {
        await mockFirestore.products.update(editingProduct.id, newProduct);
      } else {
        await mockFirestore.products.add(newProduct);
      }

      setNewProduct({
        id: '',
        sku: '',
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        mrpPerQuantity: 0,
        sellingPerQuantity: 0,
        paidCostPerQuantity: 0,
        allowLoose: false,
        minQuantity: 1,
        createdAt: new Date().toISOString()
      });
      setSelectedImage(null);
      setEditingProduct(null);
      
      toast({
        title: "Success",
        description: editingProduct ? "Product updated successfully" : "Product added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await loadProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: editingProduct ? "Failed to update product" : "Failed to add product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
  };

  const handleDelete = async (id: string) => {
    try {
      await mockFirestore.products.delete(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box h="100vh" overflow="auto" mt={"4rem"}>
      <Container maxW="container.xl" p={4}>
        <Heading mb={8}>Products</Heading>

        <Box bg="white" p={6} borderRadius="md" boxShadow="sm" mb={8}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>SKU</FormLabel>
                <Input
                  name="sku"
                  value={newProduct.sku}
                  onChange={handleInputChange}
                  placeholder="Enter SKU"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                />
              </FormControl>

              <HStack>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    <option value="grocery">Grocery</option>
                    <option value="dairy">Dairy</option>
                    <option value="beverages">Beverages</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Price</FormLabel>
                  <Input
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                  />
                </FormControl>
              </HStack>

              <HStack>
                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <Input
                    name="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock quantity"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Allow Loose</FormLabel>
                  <Select
                    name="allowLoose"
                    value={newProduct.allowLoose ? 'true' : 'false'}
                    onChange={(e) => {
                      setNewProduct((prev) => ({
                        ...prev,
                        allowLoose: e.target.value === 'true'
                      }));
                    }}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" w="full">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </VStack>
          </form>
        </Box>

        <Box bg="white" p={6} borderRadius="md" boxShadow="sm" h="700px" overflow="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Image</Th>
                <Th>SKU</Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Allow Loose</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={9} textAlign="center">
                    <Spinner />
                  </Td>
                </Tr>
              ) : products.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center">
                    No products found
                  </Td>
                </Tr>
              ) : (
                <>
                  {products.map((product) => (
                    <Tr key={product.id}>
                      <Td>
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            boxSize="50px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        ) : (
                          <Box
                            w="50px"
                            h="50px"
                            bg="gray.200"
                            borderRadius="md"
                          />
                        )}
                      </Td>
                      <Td>{product.sku}</Td>
                      <Td>{product.name}</Td>
                      <Td>{product.description}</Td>
                      <Td>{product.category}</Td>
                      <Td>{product.price}</Td>
                      <Td>{product.stock}</Td>
                      <Td>{product.allowLoose ? 'Yes' : 'No'}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit"
                            icon={<FaEdit />}
                            onClick={() => handleEdit(product)}
                            colorScheme="blue"
                            size="sm"
                          />
                          <IconButton
                            aria-label="Delete"
                            icon={<FaTrash />}
                            onClick={() => handleDelete(product.id)}
                            colorScheme="red"
                            size="sm"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </>
              )}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </Box>
  );
};
