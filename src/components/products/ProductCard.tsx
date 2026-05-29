import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Edit2, Trash2, Image } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard = ({ product, isAdmin, onEdit, onDelete }: ProductCardProps) => {
  console.log('ProductCard - isAdmin:', isAdmin, 'product:', product.name);

  return (
    <Card className="relative w-full min-w-0 shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      <div className="relative h-40 sm:h-56 w-full overflow-hidden rounded-t-lg">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain object-center p-2" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Image className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shrink-0">
            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-lg font-bold text-gray-900 break-words">{product.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500">ID: {product.id.slice(0, 8)}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-3 pb-3 sm:px-6 sm:pb-6 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between p-2.5 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Preco</span>
          </div>
          <span className="text-sm sm:text-xl font-bold text-green-600">R$ {product.price.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Estoque</span>
          </div>
          <span className={`text-sm sm:text-xl font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {product.stock} un.
          </span>
        </div>

        {product.stock <= 10 && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs sm:text-sm text-red-600 font-medium text-center">Estoque baixo!</p>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Edit button clicked for product:', product.name);
                onEdit(product);
              }}
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
            >
              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Delete button clicked for product:', product.id);
                onDelete(product.id);
              }}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Excluir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;

