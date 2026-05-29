import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalProducts: number;
  totalClients: number;
  totalSales: number;
  totalRevenue: number;
  lowStockProducts: number;
  todaySales: number;
  monthlyRevenue: number;
  topSellingProducts: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: string;
    client_name: string;
    total_amount: number;
    sale_date: string;
    items_count: number;
  }>;
  stockAlerts: Array<{
    id: string;
    name: string;
    stock_quantity: number;
    category: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar m�tricas básicas
      const [productsResult, clientsResult, salesResult] = await Promise.all([
        supabase.from('products').select('id, stock_quantity, name, category').order('stock_quantity', { ascending: true }),
        supabase.from('clients').select('id'),
        supabase.from('sales').select('id, total_amount, sale_date, client_id, clients(name)')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (salesResult.error) throw salesResult.error;

      const products = productsResult.data || [];
      const clients = clientsResult.data || [];
      const sales = salesResult.data || [];

      // Calcular m�tricas
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;
      
      // Vendas de hoje
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(sale => sale.sale_date === today).length;
      
      // Receita do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = sales
        .filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        })
        .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

      // Buscar itens de venda para produtos mais vendidos
      const { data: saleItems, error: saleItemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          products(name)
        `);

      if (saleItemsError) throw saleItemsError;

      // Calcular produtos mais vendidos
      const productSales = (saleItems || []).reduce((acc: any, item: any) => {
        const productName = item.products?.name || 'Produto Desconhecido';
        if (!acc[productName]) {
          acc[productName] = { total_sold: 0, revenue: 0 };
        }
        acc[productName].total_sold += item.quantity || 0;
        acc[productName].revenue += (item.quantity || 0) * (item.unit_price || 0);
        return acc;
      }, {});

      const topSellingProducts = Object.entries(productSales)
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);

      // Vendas recentes
      const recentSales = sales
        .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
        .slice(0, 5)
        .map(sale => ({
          id: sale.id,
          client_name: (sale.clients as any)?.name || 'Cliente não encontrado',
          total_amount: sale.total_amount || 0,
          sale_date: sale.sale_date,
          items_count: 0 // Seria necessário uma query adicional para contar itens
        }));

      // Alertas de estoque
      const stockAlerts = products
        .filter(p => p.stock_quantity < 10)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          name: p.name,
          stock_quantity: p.stock_quantity,
          category: p.category || 'Sem categoria'
        }));

      setMetrics({
        totalProducts: products.length,
        totalClients: clients.length,
        totalSales: sales.length,
        totalRevenue,
        lowStockProducts,
        todaySales,
        monthlyRevenue,
        topSellingProducts,
        recentSales,
        stockAlerts
      });

    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Carregando Dashboard...</h2>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Erro ao carregar Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!metrics) {
    return <div>Nenhum dado disponível</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📊 Dashboard - Jeser Bebidas</h1>
        <button 
          onClick={loadDashboardData}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📦 Produtos</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>{metrics.totalProducts}</div>
        </div>
        
        <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>👥 Clientes</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7b1fa2' }}>{metrics.totalClients}</div>
        </div>
        
        <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>💰 Vendas Totais</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388e3c' }}>{metrics.totalSales}</div>
        </div>
        
        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>💵 Receita Total</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>{formatCurrency(metrics.totalRevenue)}</div>
        </div>
      </div>

      {/* Métricas Secund�rias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>⚠️ Estoque Baixo</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d32f2f' }}>{metrics.lowStockProducts}</div>
        </div>
        
        <div style={{ backgroundColor: '#e0f2f1', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00796b' }}>📅 Vendas Hoje</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00796b' }}>{metrics.todaySales}</div>
        </div>
        
        <div style={{ backgroundColor: '#f1f8e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#689f38' }}>📈 Receita do Mês</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#689f38' }}>{formatCurrency(metrics.monthlyRevenue)}</div>
        </div>
      </div>

      {/* Se??es de Detalhes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        
        {/* Produtos Mais Vendidos */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>🏆 Produtos Mais Vendidos</h3>
          {metrics.topSellingProducts.length > 0 ? (
            <div>
              {metrics.topSellingProducts.map((product, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>{product.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{product.total_sold} unidades</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma venda registrada ainda.</p>
          )}
        </div>

        {/* Vendas Recentes */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>🕒 Vendas Recentes</h3>
          {metrics.recentSales.length > 0 ? (
            <div>
              {metrics.recentSales.map((sale) => (
                <div key={sale.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{sale.client_name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(sale.sale_date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>{formatCurrency(sale.total_amount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma venda registrada ainda.</p>
          )}
        </div>

        {/* Alertas de Estoque */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>⚠️ Alertas de Estoque</h3>
          {metrics.stockAlerts.length > 0 ? (
            <div>
              {metrics.stockAlerts.map((product) => (
                <div key={product.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{product.category}</div>
                    </div>
                    <div style={{ 
                      backgroundColor: product.stock_quantity === 0 ? '#f44336' : '#ff9800',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {product.stock_quantity} unidades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4CAF50', fontStyle: 'italic' }}>✅ Todos os produtos com estoque adequado!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
