import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ProductDialog from '@/components/products/ProductDialog';
import ProductSearch from '@/components/products/ProductSearch';
import ProductList from '@/components/products/ProductList';

interface FormData {
  name: string;
  price: string;
  stock: string;
  image?: string;
}

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    stock: '',
    image: ''
  });

  const isAdmin = user?.type === 'admin';
  console.log('Products page - user:', user, 'isAdmin:', isAdmin);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  useEffect(() => {
    setVisibleProducts(6);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem gerenciar produtos",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({
        title: "Produto atualizado!",
        description: "As informações do produto foram atualizadas com sucesso",
      });
    } else {
      addProduct(productData);
      toast({
        title: "Produto cadastrado!",
        description: "Novo produto adicionado ao estoque",
      });
    }

    resetForm();
  };

  const handleEdit = (product: any) => {
    console.log('handleEdit called with product:', product);
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem gerenciar produtos",
        variant: "destructive",
      });
      return;
    }

    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    console.log('handleDelete called with productId:', productId);
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem gerenciar produtos",
        variant: "destructive",
      });
      return;
    }

    deleteProduct(productId);
    toast({
      title: "Produto excluído!",
      description: "O produto foi removido do estoque",
    });
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', image: '' });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos da distribuidora</p>
        </div>

        <ProductDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
          isAdmin={isAdmin}
        />
      </div>

      <ProductSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <ProductList
        products={products}
        filteredProducts={filteredProducts}
        displayedProducts={displayedProducts}
        visibleProducts={visibleProducts}
        setVisibleProducts={setVisibleProducts}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        searchTerm={searchTerm}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenDialog={handleOpenDialog}
      />
    </div>
  );
};

export default Products;
