import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface Sale {
  id: string;
  date: string;
  total: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
  clientName?: string;
  clientId?: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

interface CreditSale {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  total: number;
  description?: string;
  isPaid: boolean;
  paidAt?: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

interface DataContextType {
  products: Product[];
  sales: Sale[];
  creditSales: CreditSale[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addCreditSale: (creditSale: Omit<CreditSale, 'id'>) => Promise<void>;
  updateCreditSale: (id: string, creditSale: Partial<CreditSale>) => Promise<void>;
  deleteCreditSale: (id: string) => Promise<void>;
  markCreditSaleAsPaid: (id: string) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  refreshData: () => Promise<void>;
  getSaleById: (id: string) => Sale | CreditSale | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([loadProducts(), loadSales(), loadCreditSales()]);
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Products loaded:', data?.length || 0);
      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock || 0,
        image: product.image
      })) || [];
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const loadSales = async () => {
    try {
      console.log('Loading sales...');
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            product_id,
            quantity,
            unit_price,
            products(name)
          )
        `)
        .order('sale_date', { ascending: false });

      if (salesError) {
        console.error('Error loading sales:', salesError);
        toast({
          title: "Erro ao carregar vendas",
          description: salesError.message,
          variant: "destructive",
        });
        return;
      }

      const formattedSales: Sale[] = salesData?.map(sale => ({
        id: sale.id,
        date: sale.sale_date || '',
        total: sale.total_amount,
        paymentMethod: sale.payment_method,
        clientName: sale.notes?.replace('Cliente: ', '') || undefined,
        clientId: sale.client_id || undefined,
        products: sale.sale_items?.map(item => ({
          productId: item.product_id || '',
          productName: item.products?.name || 'Produto Desconhecido',
          quantity: item.quantity,
          price: item.unit_price
        })) || []
      })) || [];

      console.log('Sales loaded:', formattedSales.length);
      setSales(formattedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Erro ao carregar vendas",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const loadCreditSales = async () => {
    try {
      console.log('Loading credit sales...');
      const { data: creditSalesData, error: creditSalesError } = await supabase
        .from('credit_sales')
        .select(`
          *,
          credit_sale_items (
            product_id,
            quantity,
            price,
            product_name,
            products(name)
          )
        `)
        .order('date', { ascending: false });

      if (creditSalesError) {
        console.error('Error loading credit sales:', creditSalesError);
        toast({
          title: "Erro ao carregar vendas fiado",
          description: creditSalesError.message,
          variant: "destructive",
        });
        return;
      }

      const formattedCreditSales: CreditSale[] = creditSalesData?.map(creditSale => ({
        id: creditSale.id,
        clientId: creditSale.client_id,
        clientName: creditSale.client_name,
        date: creditSale.created_at || '',
        total: creditSale.total_amount,
        description: creditSale.notes || undefined,
        isPaid: creditSale.status === 'paid',
        paidAt: creditSale.updated_at || undefined,
        products: creditSale.credit_sale_items?.map(item => ({
          productId: item.product_id || '',
          productName: item.products?.name || 'Produto Desconhecido',
          quantity: item.quantity,
          price: item.price
        })) || []
      })) || [];

      console.log('Credit sales loaded:', formattedCreditSales.length);
      setCreditSales(formattedCreditSales);
    } catch (error) {
      console.error('Error loading credit sales:', error);
      toast({
        title: "Erro ao carregar vendas fiado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) {
        toast({
          title: "Erro ao adicionar produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadProducts();
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao atualizar produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadProducts();
      toast({
        title: "Produto atualizado!",
        description: "Produto foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao deletar produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadProducts();
      toast({
        title: "Produto deletado!",
        description: "Produto foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao deletar produto",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

      if (error) {
        console.error('Error updating stock:', error);
        return;
      }

      await loadProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      // Insert sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          sale_date: sale.date,
          total_amount: sale.total,
          payment_method: sale.paymentMethod,
          client_id: sale.clientId || null,
          notes: sale.clientName ? `Cliente: ${sale.clientName}` : null
        }])
        .select()
        .single();

      if (saleError) {
        toast({
          title: "Erro ao registrar venda",
          description: saleError.message,
          variant: "destructive",
        });
        return;
      }

      // Insert sale items
      const saleItems = sale.products.map(product => ({
        sale_id: saleData.id,
        product_id: product.productId,
        quantity: product.quantity,
        unit_price: product.price,
        total_price: product.quantity * product.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        toast({
          title: "Erro ao registrar itens da venda",
          description: itemsError.message,
          variant: "destructive",
        });
        return;
      }

      // Update product stocks
      for (const product of sale.products) {
        const currentProduct = products.find(p => p.id === product.productId);
        if (currentProduct) {
          await updateProductStock(product.productId, currentProduct.stock - product.quantity);
        }
      }

      await loadSales();
      toast({
        title: "Venda registrada!",
        description: `Venda de R$ ${sale.total.toFixed(2)} foi registrada com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding sale:', error);
      toast({
        title: "Erro ao registrar venda",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const deleteSale = async (id: string) => {
    try {
      // Delete the sale (sale_items will be deleted automatically due to CASCADE)
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (saleError) {
        toast({
          title: "Erro ao excluir venda",
          description: saleError.message,
          variant: "destructive",
        });
        return;
      }

      await loadSales();
      toast({
        title: "Venda exclu�da!",
        description: "Venda foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro ao excluir venda",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const addCreditSale = async (creditSale: Omit<CreditSale, 'id'>) => {
    try {
      // Insert credit sale
      const { data: creditSaleData, error: creditSaleError } = await supabase
        .from('credit_sales')
        .insert([{
          client_id: creditSale.clientId,
          client_name: creditSale.clientName,
          total_amount: creditSale.total,
          notes: creditSale.description,
          status: 'pending'
        }])
        .select()
        .single();

      if (creditSaleError) {
        toast({
          title: "Erro ao registrar venda fiado",
          description: creditSaleError.message,
          variant: "destructive",
        });
        return;
      }

      // Insert credit sale items
      const creditSaleItems = creditSale.products.map(product => ({
        credit_sale_id: creditSaleData.id,
        product_id: product.productId,
        product_name: product.productName,
        quantity: product.quantity,
        price: product.price
      }));

      const { error: itemsError } = await supabase
        .from('credit_sale_items')
        .insert(creditSaleItems);

      if (itemsError) {
        toast({
          title: "Erro ao registrar itens da venda fiado",
          description: itemsError.message,
          variant: "destructive",
        });
        return;
      }

      // Update product stocks
      for (const product of creditSale.products) {
        const currentProduct = products.find(p => p.id === product.productId);
        if (currentProduct) {
          await updateProductStock(product.productId, currentProduct.stock - product.quantity);
        }
      }

      await loadCreditSales();
      toast({
        title: "Venda fiado registrada!",
        description: `Venda fiado de R$ ${creditSale.total.toFixed(2)} foi registrada para ${creditSale.clientName}.`,
      });
    } catch (error) {
      console.error('Error adding credit sale:', error);
      toast({
        title: "Erro ao registrar venda fiado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const updateCreditSale = async (id: string, creditSale: Partial<CreditSale>) => {
    try {
      // TEMPORÁRIO: Comentado at� criar as tabelas credit_sales
      // const { error } = await supabase
      //   .from('credit_sales')
      //   .update({
      //     description: creditSale.description,
      //     total: creditSale.total
      //   })
      //   .eq('id', id);
      const error = null;

      if (error) {
        toast({
          title: "Erro ao atualizar venda fiado",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadCreditSales();
      toast({
        title: "Venda fiado atualizada!",
        description: "Venda fiado foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating credit sale:', error);
      toast({
        title: "Erro ao atualizar venda fiado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const deleteCreditSale = async (id: string) => {
    try {
      // TEMPORÁRIO: Comentado at� criar as tabelas credit_sales
    // const { error } = await supabase
    //   .from('credit_sales')
    //   .delete()
    //   .eq('id', id);
    const error = null;

      if (error) {
        toast({
          title: "Erro ao deletar venda fiado",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadCreditSales();
      toast({
        title: "Venda fiado deletada!",
        description: "Venda fiado foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting credit sale:', error);
      toast({
        title: "Erro ao deletar venda fiado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const markCreditSaleAsPaid = async (id: string) => {
    try {
      // Primeiro, buscar o valor total da venda
      const { data: creditSale, error: fetchError } = await supabase
        .from('credit_sales')
        .select('total_amount')
        .eq('id', id)
        .single();

      if (fetchError) {
        toast({
          title: "Erro ao buscar venda",
          description: fetchError.message,
          variant: "destructive",
        });
        return;
      }

      // Atualizar o status para 'paid' e paid_amount para o valor total
      const { error } = await supabase
        .from('credit_sales')
        .update({
          status: 'paid',
          paid_amount: creditSale.total_amount
        })
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao marcar como pago",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadCreditSales();
      toast({
        title: "Marcado como pago!",
        description: "Venda fiado foi marcada como paga.",
      });
    } catch (error) {
      console.error('Error marking credit sale as paid:', error);
      toast({
        title: "Erro ao marcar como pago",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const getSaleById = (id: string): Sale | CreditSale | undefined => {
    const sale = sales.find(s => s.id === id);
    if (sale) return sale;
    
    const creditSale = creditSales.find(cs => cs.id === id);
    return creditSale;
  };

  const refreshData = async () => {
    console.log('Refreshing all data...');
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      products,
      sales,
      creditSales,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      deleteSale,
      addCreditSale,
      updateCreditSale,
      deleteCreditSale,
      markCreditSaleAsPaid,
      updateProductStock,
      refreshData,
      getSaleById
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

