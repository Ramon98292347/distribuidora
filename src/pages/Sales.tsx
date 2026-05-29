import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useClients } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone, X, Edit, Trash2, Check, FileText, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const Sales = () => {
  const { products, addSale, creditSales, addCreditSale, updateCreditSale, deleteCreditSale, markCreditSaleAsPaid, sales, deleteSale } = useData();
  const { clients } = useClients();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao'>('dinheiro');
  const [selectedClient, setSelectedClient] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [editingCreditSale, setEditingCreditSale] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const isAdmin = user?.type === 'admin';

  const addToCart = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (product.stock < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stock} unidades dispon�veis`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProduct);
    
    if (existingItem) {
      const totalQuantity = existingItem.quantity + quantity;
      if (product.stock < totalQuantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Total solicitado (${totalQuantity}) excede o estoque dispon�vel (${product.stock})`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === selectedProduct
          ? { ...item, quantity: totalQuantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: selectedProduct,
        productName: product.name,
        price: product.price,
        quantity: quantity
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stock} unidades dispon�veis`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const completeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda",
        variant: "destructive",
      });
      return;
    }

    const selectedClientData = clients.find(c => c.id === selectedClient);

    const saleData = {
      date: new Date().toISOString(),
      products: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      })),
      total,
      paymentMethod,
      clientId: selectedClient || undefined,
      clientName: selectedClientData?.name || ''
    };

    try {
      await addSale(saleData);
      
      // Encontrar a venda rec�m-criada para obter o ID
      const latestSale = sales[0]; // Assumindo que a venda mais recente ser� a primeira
      
      setCart([]);
      setSelectedClient('');
      setPaymentMethod('dinheiro');
      
      toast({
        title: "Venda realizada!",
        description: `Venda de R$ ${total.toFixed(2)} finalizada com sucesso`,
        action: latestSale ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/receipt/${latestSale.id}`)}
            className="flex items-center space-x-1"
          >
            <FileText className="h-3 w-3" />
            <span>Ver Recibo</span>
          </Button>
        ) : undefined,
      });
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
    }
  };

  const completeCreditSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClient) {
      toast({
        title: "Cliente obrigat�rio",
        description: "Selecione um cliente para vendas fiado",
        variant: "destructive",
      });
      return;
    }

    const selectedClientData = clients.find(c => c.id === selectedClient);

    const creditSaleData = {
      clientId: selectedClient,
      clientName: selectedClientData?.name || '',
      date: new Date().toISOString(),
      total,
      description: creditDescription,
      isPaid: false,
      products: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      await addCreditSale(creditSaleData);
      setCart([]);
      setSelectedClient('');
      setCreditDescription('');
      
      toast({
        title: "Venda fiado realizada!",
        description: `Venda fiado de R$ ${total.toFixed(2)} registrada para ${selectedClientData?.name}`,
      });
    } catch (error) {
      console.error('Erro ao finalizar venda fiado:', error);
    }
  };

  const handleEditCreditSale = (creditSaleId: string, currentDescription: string) => {
    setEditingCreditSale(creditSaleId);
    setEditDescription(currentDescription);
  };

  const saveEditCreditSale = async () => {
    if (editingCreditSale) {
      await updateCreditSale(editingCreditSale, { description: editDescription });
      setEditingCreditSale(null);
      setEditDescription('');
    }
  };

  const cancelEditCreditSale = () => {
    setEditingCreditSale(null);
    setEditDescription('');
  };

  const handleDeleteReceipt = async (saleId: string, saleType: 'regular' | 'credit') => {
    try {
      if (saleType === 'regular') {
        await deleteSale(saleId);
        toast({
          title: "Recibo exclu�do",
          description: "Recibo de venda � vista exclu�do com sucesso",
        });
      } else {
        await deleteCreditSale(saleId);
        toast({
          title: "Recibo exclu�do",
          description: "Recibo de venda fiado exclu�do com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir recibo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir recibo",
        variant: "destructive",
      });
    }
  };

  // Group credit sales by client and calculate totals
  const creditSalesByClient = creditSales
    .filter(cs => !cs.isPaid)
    .reduce((acc, creditSale) => {
      if (!acc[creditSale.clientId]) {
        acc[creditSale.clientId] = {
          clientName: creditSale.clientName,
          sales: [],
          total: 0
        };
      }
      acc[creditSale.clientId].sales.push(creditSale);
      acc[creditSale.clientId].total += creditSale.total;
      return acc;
    }, {} as Record<string, { clientName: string; sales: any[]; total: number }>);

  // Combinar todas as vendas (� vista e fiado) para mostrar os recibos
  const allSales = [
    ...sales.map(sale => ({ ...sale, type: 'regular' as const })),
    ...creditSales.map(sale => ({ ...sale, type: 'credit' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie vendas � vista e fiado</p>
        </div>
      </div>

      <Tabs defaultValue="cash" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cash">Venda � Vista</TabsTrigger>
          <TabsTrigger value="credit">Venda Fiado</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="receipts">Recibos</TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-6">
          {/* Adicionar produtos */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span>Adicionar Produto</span>
              </CardTitle>
              <CardDescription>
                Selecione produtos para adicionar ao carrinho
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
                        {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <Button 
                onClick={addToCart}
                disabled={!selectedProduct}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>

          {/* Carrinho */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <span>Carrinho de Compras</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  R$ {total.toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Finaliza��o da venda � vista */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Finalizar Venda</CardTitle>
              <CardDescription>
                Selecione o m�todo de pagamento e cliente (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente (Opcional)</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>M�todo de Pagamento</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === 'dinheiro' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('dinheiro')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Banknote className="h-6 w-6 mb-2" />
                    <span className="text-sm">Dinheiro</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('pix')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Smartphone className="h-6 w-6 mb-2" />
                    <span className="text-sm">PIX</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'cartao' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cartao')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="text-sm">Cart�o</span>
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Total: R$ {total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pagamento: {paymentMethod === 'dinheiro' ? 'Dinheiro' : paymentMethod === 'pix' ? 'PIX' : 'Cart�o'}
                  </p>
                </div>
                <Button 
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Finalizar Venda
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          {/* Adicionar produtos para venda fiado */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span>Nova Venda Fiado</span>
              </CardTitle>
              <CardDescription>
                Adicione produtos para venda fiado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente (Obrigat�rio)</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditDescription">Descri��o (Opcional)</Label>
                <Input
                  id="creditDescription"
                  placeholder="Ex: Compra de bebidas para festa"
                  value={creditDescription}
                  onChange={(e) => setCreditDescription(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={addToCart}
                disabled={!selectedProduct}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>

          {/* Carrinho para venda fiado */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <span>Carrinho Fiado</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  R$ {total.toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Total: R$ {total.toFixed(2)}
                  </p>
                </div>
                <Button 
                  onClick={completeCreditSale}
                  disabled={cart.length === 0 || !selectedClient}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Registrar Fiado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {/* Vendas Fiado Pendentes */}
          {Object.keys(creditSalesByClient).length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Nenhuma venda fiado pendente
                </h3>
                <p className="text-gray-600">
                  Todas as vendas fiado foram quitadas ou n�o h� vendas registradas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {Object.entries(creditSalesByClient).map(([clientId, clientData]) => (
                <Card key={clientId} className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{clientData.clientName}</span>
                      <span className="text-xl font-bold text-red-600">
                        R$ {clientData.total.toFixed(2)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {clientData.sales.length} venda{clientData.sales.length > 1 ? 's' : ''} pendente{clientData.sales.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {clientData.sales.map((creditSale) => (
                      <div key={creditSale.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">R$ {creditSale.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(creditSale.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/receipt/${creditSale.id}`)}
                              className="flex items-center space-x-1"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Recibo</span>
                            </Button>
                            {editingCreditSale === creditSale.id ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={saveEditCreditSale}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditCreditSale}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCreditSale(creditSale.id, creditSale.description || '')}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteCreditSale(creditSale.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => markCreditSaleAsPaid(creditSale.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {editingCreditSale === creditSale.id ? (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Descri��o da venda"
                            className="mt-2"
                          />
                        ) : (
                          creditSale.description && (
                            <p className="text-sm text-gray-700 mt-2">
                              {creditSale.description}
                            </p>
                          )
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Produtos:</p>
                          <div className="text-sm text-gray-700">
                            {creditSale.products.map((product, index) => (
                              <span key={index}>
                                {product.productName} ({product.quantity}x)
                                {index < creditSale.products.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          {/* Nova aba para visualizar todos os recibos com op��o de excluir */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span>Todos os Recibos</span>
              </CardTitle>
              <CardDescription>
                Visualize todos os recibos emitidos (vendas � vista e fiado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allSales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma venda registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">
                            R$ {sale.total.toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sale.type === 'regular' 
                              ? 'bg-green-100 text-green-800' 
                              : sale.type === 'credit' && 'isPaid' in sale && sale.isPaid
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                          }`}>
                            {sale.type === 'regular' 
                              ? 'À Vista' 
                              : sale.type === 'credit' && 'isPaid' in sale && sale.isPaid
                                ? 'Fiado - Pago'
                                : 'Fiado - Pendente'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleString('pt-BR')}
                        </p>
                        {sale.clientName && (
                          <p className="text-sm text-gray-600">
                            Cliente: {sale.clientName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Produtos: {sale.products.map(p => p.productName).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/receipt/${sale.id}`)}
                          className="flex items-center space-x-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Ver Recibo</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReceipt(sale.id, sale.type)}
                          className="text-red-600 hover:bg-red-50 flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;

