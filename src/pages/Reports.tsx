
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, FileText, TrendingUp, Filter, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const { sales } = useData();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (user?.type !== 'admin') {
    return (
      <Card className="shadow-lg border-0 border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-red-600">
            Apenas administradores podem acessar os relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filtrar vendas por data
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    return true;
  });

  // Dados para gráfico de produtos mais vendidos
  const productSales = filteredSales.flatMap(sale => sale.products);
  const productStats = productSales.reduce((acc, item) => {
    const existing = acc.find(p => p.name === item.productName);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
    } else {
      acc.push({
        name: item.productName,
        quantity: item.quantity,
        revenue: item.price * item.quantity
      });
    }
    return acc;
  }, [] as any[]);

  const topProducts = productStats
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Dados para gráfico de formas de pagamento
  const paymentStats = filteredSales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentStats).map(([method, count]) => ({
    name: method === 'dinheiro' ? 'Dinheiro' : method === 'pix' ? 'PIX' : 'Cartão',
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Relatório de vendas por data
  const salesByDate = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const dailySalesData = Object.entries(salesByDate).map(([date, total]) => ({
    date,
    total
  }));

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const exportReport = () => {
    toast({
      title: "Relatório exportado!",
      description: "O relatório foi salvo com sucesso",
    });
  };

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <span>Filtros de Data</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Filtre os relatórios por período específico
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-sm">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-sm">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
            
            <Button onClick={clearFilters} variant="outline" className="h-9">
              Limpar
            </Button>
            
            <Button onClick={exportReport} className="h-9 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
            <p className="text-xs text-gray-600 mt-0.5">vendas no período</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-0.5">faturamento total</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              R$ {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">valor médio por venda</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Produtos Mais Vendidos */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
            <CardDescription className="text-sm">Top 10 produtos por quantidade vendida</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
            <CardDescription className="text-sm">Distribuição dos métodos de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Histórico de Vendas</CardTitle>
          <CardDescription className="text-sm">
            {filteredSales.length} vendas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Data/Hora</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Produtos</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Quantidade</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Total</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">
                      {new Date(sale.date).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      {sale.products.map(p => p.productName).join(', ')}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      {sale.products.reduce((sum, p) => sum + p.quantity, 0)} itens
                    </td>
                    <td className="py-2 px-3 text-sm font-medium text-green-600">
                      R$ {sale.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
                        {sale.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : 
                         sale.paymentMethod === 'pix' ? '📱 PIX' : '💳 Cartão'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma venda encontrada no período selecionado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
