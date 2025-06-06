import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingBag,
  BarChart3,
  Calendar
} from 'lucide-react';
import QuickProductEntry from '@/components/QuickProductEntry';
import DashboardCardDialog from '@/components/dashboard/DashboardCardDialog';

const Dashboard = () => {
  const { products, sales } = useData();
  const [selectedCard, setSelectedCard] = useState<{ type: string; title: string } | null>(null);

  // Calcular métricas
  const today = new Date().toDateString();
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
  const weekSales = sales.filter(sale => new Date(sale.date) >= thisWeek);
  const monthSales = sales.filter(sale => new Date(sale.date) >= thisMonth);

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const todaySalesCount = todaySales.length;

  // Top 5 produtos mais vendidos
  const productSales = sales.flatMap(sale => sale.products);
  const productCount = productSales.reduce((acc, item) => {
    acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const cards = [
    {
      title: 'Receita do Dia',
      value: `R$ ${todayRevenue.toFixed(2)}`,
      description: 'Vendas de hoje',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      type: 'today-revenue'
    },
    {
      title: 'Receita da Semana',
      value: `R$ ${weekRevenue.toFixed(2)}`,
      description: 'Últimos 7 dias',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      type: 'week-revenue'
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${monthRevenue.toFixed(2)}`,
      description: 'Mês atual',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      type: 'month-revenue'
    },
    {
      title: 'Vendas do Dia',
      value: todaySalesCount.toString(),
      description: 'Total de vendas hoje',
      icon: ShoppingBag,
      color: 'from-orange-500 to-red-500',
      type: 'today-sales'
    },
    {
      title: 'Estoque Total',
      value: totalStock.toString(),
      description: 'Produtos em estoque',
      icon: Package,
      color: 'from-teal-500 to-green-500',
      type: 'stock'
    },
    {
      title: 'Total de Produtos',
      value: products.length.toString(),
      description: 'Produtos cadastrados',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      type: 'products'
    }
  ];

  const handleCardClick = (cardType: string, cardTitle: string) => {
    setSelectedCard({ type: cardType, title: cardTitle });
  };

  return (
    <div className="space-y-8">
      {/* Cartões de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick(card.type, card.title)}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-10`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-700">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-600 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Entrada Rápida de Produtos */}
      <QuickProductEntry />

      {/* Top 5 Produtos */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span>Top 5 Produtos Mais Vendidos</span>
          </CardTitle>
          <CardDescription>
            Produtos com maior volume de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map(([productName, quantity], index) => (
                <div key={productName} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${
                      index === 0 ? 'from-yellow-500 to-orange-500' :
                      index === 1 ? 'from-gray-400 to-gray-500' :
                      index === 2 ? 'from-orange-600 to-red-600' :
                      'from-blue-500 to-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{productName}</p>
                      <p className="text-sm text-gray-600">{quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda registrada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para mostrar detalhes do card */}
      <DashboardCardDialog
        isOpen={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        cardType={selectedCard?.type || ''}
        title={selectedCard?.title || ''}
      />
    </div>
  );
};

export default Dashboard;
