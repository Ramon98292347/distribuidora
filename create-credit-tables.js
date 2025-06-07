import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createCreditTables() {
  console.log('🔄 Criando tabelas de vendas fiado...');
  
  try {
    // Criar tabela credit_sales
    const { error: creditSalesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS credit_sales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
          client_name VARCHAR(255) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'pending',
          due_date DATE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (creditSalesError) {
      console.log('❌ Erro ao criar credit_sales:', creditSalesError.message);
    } else {
      console.log('✅ Tabela credit_sales criada');
    }
    
    // Criar tabela credit_sale_items
    const { error: creditItemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS credit_sale_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (creditItemsError) {
      console.log('❌ Erro ao criar credit_sale_items:', creditItemsError.message);
    } else {
      console.log('✅ Tabela credit_sale_items criada');
    }
    
    // Habilitar RLS
    const { error: rlsError1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;'
    });
    
    const { error: rlsError2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;'
    });
    
    // Criar políticas permissivas
    const { error: policyError1 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);'
    });
    
    const { error: policyError2 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);'
    });
    
    console.log('✅ Configuração de segurança aplicada');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Verificar se as tabelas existem tentando fazer uma query simples
async function checkAndCreateTables() {
  console.log('🔄 Verificando tabelas existentes...');
  
  try {
    // Tentar acessar credit_sales
    const { data: creditSales, error: creditSalesError } = await supabase
      .from('credit_sales')
      .select('id')
      .limit(1);
    
    if (creditSalesError) {
      console.log('❌ Tabela credit_sales não existe:', creditSalesError.message);
      console.log('📝 Você precisa criar as tabelas manualmente no Supabase SQL Editor.');
      console.log('📄 Use o arquivo create-credit-sales-tables.sql');
    } else {
      console.log('✅ Tabela credit_sales existe');
    }
    
    // Tentar acessar credit_sale_items
    const { data: creditItems, error: creditItemsError } = await supabase
      .from('credit_sale_items')
      .select('id')
      .limit(1);
    
    if (creditItemsError) {
      console.log('❌ Tabela credit_sale_items não existe:', creditItemsError.message);
    } else {
      console.log('✅ Tabela credit_sale_items existe');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar
checkAndCreateTables().then(() => {
  console.log('✅ Verificação concluída');
}).catch(error => {
  console.log('❌ Erro:', error.message);
});