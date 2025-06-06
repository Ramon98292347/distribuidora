
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
    <Card className="relative shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Imagem do produto */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Image className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Header com nome e ID */}
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">{product.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">ID: {product.id.slice(0, 8)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {/* Seção do Preço */}
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Preço</span>
          </div>
          <span className="text-xl font-bold text-green-600">
            R$ {product.price.toFixed(2)}
          </span>
        </div>
        
        {/* Seção do Estoque */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Estoque</span>
          </div>
          <span className={`text-xl font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {product.stock} un.
          </span>
        </div>
        
        {/* Alerta de estoque baixo */}
        {product.stock <= 10 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium text-center">⚠️ Estoque baixo!</p>
          </div>
        )}

        {/* Botões de ação para admins */}
        {isAdmin && (
          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Edit button clicked for product:', product.name);
                onEdit(product);
              }}
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Delete button clicked for product:', product.id);
                onDelete(product.id);
              }}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
