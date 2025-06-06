
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductListProps {
  products: Product[];
  filteredProducts: Product[];
  displayedProducts: Product[];
  visibleProducts: number;
  setVisibleProducts: (value: number | ((prev: number) => number)) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchTerm: string;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onOpenDialog: () => void;
}

const ProductList = ({
  products,
  filteredProducts,
  displayedProducts,
  visibleProducts,
  setVisibleProducts,
  isLoading,
  setIsLoading,
  searchTerm,
  isAdmin,
  onEdit,
  onDelete,
  onOpenDialog
}: ProductListProps) => {
  console.log('ProductList - isAdmin:', isAdmin, 'displayedProducts count:', displayedProducts.length);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleProducts < filteredProducts.length && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleProducts(prev => Math.min(prev + 6, filteredProducts.length));
            setIsLoading(false);
          }, 500);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleProducts, filteredProducts.length, isLoading]);

  if (filteredProducts.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente buscar com outros termos'
              : 'Comece adicionando produtos ao seu estoque'
            }
          </p>
          {isAdmin && !searchTerm && (
            <Button 
              onClick={onOpenDialog}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {visibleProducts < filteredProducts.length && !isLoading && (
        <div className="flex justify-center py-4">
          <Button 
            onClick={() => setVisibleProducts(prev => Math.min(prev + 6, filteredProducts.length))}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Carregar mais produtos
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductList;
