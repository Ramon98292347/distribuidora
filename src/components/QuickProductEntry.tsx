
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package2, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const QuickProductEntry = () => {
  const { products, addProduct, updateProduct } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: ''
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [addToStock, setAddToStock] = useState('');

  const isAdmin = user?.type === 'admin';

  if (!isAdmin) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    addProduct(productData);
    setFormData({ name: '', price: '', stock: '' });
    
    toast({
      title: "Produto adicionado!",
      description: `${productData.name} foi adicionado com ${productData.stock} unidades`,
    });
  };

  const handleStockUpdate = () => {
    if (!selectedProduct || !addToStock) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newStock = product.stock + parseInt(addToStock);
    updateProduct(product.id, { ...product, stock: newStock });
    
    setSelectedProduct('');
    setAddToStock('');
    
    toast({
      title: "Estoque atualizado!",
      description: `${product.name} agora tem ${newStock} unidades`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cadastro Rápido */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <span>Cadastro Rápido</span>
          </CardTitle>
          <CardDescription>
            Adicione novos produtos rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quick-name">Produto</Label>
                <Input
                  id="quick-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coca-Cola 2L"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-price">Preço (R$)</Label>
                <Input
                  id="quick-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="8.90"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-stock">Quantidade</Label>
              <Input
                id="quick-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Atualização de Estoque */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <span>Atualizar Estoque</span>
          </CardTitle>
          <CardDescription>
            Adicione estoque aos produtos existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Estoque atual: {product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="add-stock">Quantidade a Adicionar</Label>
            <Input
              id="add-stock"
              type="number"
              value={addToStock}
              onChange={(e) => setAddToStock(e.target.value)}
              placeholder="1000"
            />
          </div>
          
          <Button 
            onClick={handleStockUpdate}
            disabled={!selectedProduct || !addToStock}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Zap className="h-4 w-4 mr-2" />
            Atualizar Estoque
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickProductEntry;

