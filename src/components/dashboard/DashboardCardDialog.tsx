
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

interface DashboardCardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cardType: string;
  title: string;
}

const DashboardCardDialog = ({ isOpen, onOpenChange, cardType, title }: DashboardCardDialogProps) => {
  const { sales, products } = useData();

  const today = new Date().toDateString();
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
  const weekSales = sales.filter(sale => new Date(sale.date) >= thisWeek);
  const monthSales = sales.filter(sale => new Date(sale.date) >= thisMonth);

  const renderContent = () => {
    switch (cardType) {
      case 'today-revenue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vendas de Hoje</h3>
            {todaySales.length === 0 ? (
              <p className="text-gray-500">Nenhuma venda hoje</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {todaySales.map((sale) => (
                  <Card key={sale.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">R$ {sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleTimeString('pt-BR')}
                        </p>
                        {'paymentMethod' in sale && (
                          <p className="text-xs text-gray-500 capitalize">{sale.paymentMethod}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {sale.products.length} item(s)
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'week-revenue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vendas da Semana</h3>
            {weekSales.length === 0 ? (
              <p className="text-gray-500">Nenhuma venda esta semana</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {weekSales.map((sale) => (
                  <Card key={sale.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">R$ {sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {sale.products.length} item(s)
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'month-revenue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vendas do Mês</h3>
            {monthSales.length === 0 ? (
              <p className="text-gray-500">Nenhuma venda este mês</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {monthSales.map((sale) => (
                  <Card key={sale.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">R$ {sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {sale.products.length} item(s)
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'today-sales':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes das Vendas de Hoje</h3>
            <p className="text-gray-600">Total de {todaySales.length} venda(s) hoje</p>
            {todaySales.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {todaySales.map((sale) => (
                  <Card key={sale.id} className="p-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">R$ {sale.total.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Produtos: {sale.products.map(p => p.productName).join(', ')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'stock':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produtos em Estoque</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock} un.
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produtos Cadastrados</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Estoque: {product.stock}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Informações não disponíveis</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCardDialog;
