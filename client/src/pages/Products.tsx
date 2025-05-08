import { Box, Heading, VStack, HStack, Button, Container, FormControl, FormLabel, Input, Select, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton, Spinner, Image } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../services/auth';
import { categories, Product } from '../types';
import { useAuth } from '../hooks/useAuthHook';
import { toDisplayCase } from '../utils/stringUtils';

export const Products = () => {
  const { authSession } = useAuth();
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
    b2bMrpPerQuantity: 0,
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
      const response = await fetch(`${API_URL}/api/vendor/products`, {
        headers: {
          'Authorization': `Bearer ${authSession?.token}`
        }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
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
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [setProducts, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct((prev: Product | null) => {
        if (!prev) return null;
        return {
          ...prev,
          [name]: name === 'allowLoose' ? (value === 'on') :
            name === 'minQuantity' ? parseInt(value) :
              name === 'price' ? parseFloat(value) :
                name === 'stock' ? parseInt(value) :
                  name === 'mrpPerQuantity' ? parseFloat(value) :
                    name === 'b2bMrpPerQuantity' ? parseFloat(value) :
                      name === 'paidCostPerQuantity' ? parseFloat(value) :
                        value
        };
      })
    }

    setNewProduct((prev: Product) => ({
      ...prev,
      [name]: name === 'allowLoose' ? (value === 'on') :
        name === 'minQuantity' ? parseInt(value) :
          name === 'price' ? parseFloat(value) :
            name === 'stock' ? parseInt(value) :
              name === 'mrpPerQuantity' ? parseFloat(value) :
                name === 'b2bMrpPerQuantity' ? parseFloat(value) :
                  name === 'paidCostPerQuantity' ? parseFloat(value) :
                    value
    }));

  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.b2bMrpPerQuantity) {
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
      const response = await fetch(`${API_URL}/api/vendor/products/create`, {
        method: 'POST',
        body: JSON.stringify(newProduct),
        headers: {
          'Authorization': `Bearer ${authSession?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
      setProducts(prev => [...prev, data]);
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
        b2bMrpPerQuantity: 0,
        paidCostPerQuantity: 0,
        allowLoose: false,
        minQuantity: 1,
        createdAt: new Date().toISOString()
      });
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Product created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/vendor/products/update`, {
        method: 'POST',
        body: JSON.stringify(editingProduct),
        headers: {
          'Authorization': `Bearer ${authSession?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
      setProducts(products.map((product) => {
        if (product.id === data.id) {
          return data;
        }
        return product;
      }));
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
        b2bMrpPerQuantity: 0,
        paidCostPerQuantity: 0,
        allowLoose: false,
        minQuantity: 1,
        createdAt: new Date().toISOString()
      });
      setSelectedImage(null);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
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
      await fetch(`${API_URL}/api/vendor/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authSession?.token}`
        }
      });
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
          <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
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
                    {categories.map((category) => {
                      const value = category === '' ? 'Select Category' : category;
                      return (
                        <option key={category} value={value}>{toDisplayCase(value)}</option>
                      )
                    })}
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
                  <FormLabel>B2B Price</FormLabel>
                  <Input
                    name="b2bMrpPerQuantity"
                    type="number"
                    value={newProduct.b2bMrpPerQuantity}
                    onChange={handleInputChange}
                    placeholder="Enter B2B Price"
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
                <Th>B2B Price</Th>
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
                      <Td>{product.b2bMrpPerQuantity}</Td>
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
