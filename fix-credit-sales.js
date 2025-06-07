import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createCreditSalesTables() {
  console.log('🔄 Criando tabelas de vendas fiado...');
  
  try {
    // Primeiro, criar a tabela credit_sales
    console.log('📝 Criando tabela credit_sales...');
    const createCreditSalesQuery = `
      CREATE TABLE IF NOT EXISTS credit_sales (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        due_date DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all operations" ON credit_sales;
      CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
    `;
    
    // Executar usando uma query SQL direta
    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: createCreditSalesQuery
    });
    
    if (error1) {
      console.log('❌ Erro ao criar credit_sales:', error1.message);
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');
      
      // Criar usando queries individuais
      const queries = [
        "CREATE TABLE IF NOT EXISTS credit_sales (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, client_name VARCHAR(255) NOT NULL, total_amount DECIMAL(10,2) NOT NULL DEFAULT 0, paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0, status VARCHAR(50) DEFAULT 'pending', due_date DATE, notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());",
        "ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;",
        "CREATE POLICY IF NOT EXISTS \"Allow all operations\" ON credit_sales FOR ALL USING (true);"
      ];
      
      for (const query of queries) {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log('❌ Erro na query:', query.substring(0, 50) + '...', error.message);
        }
      }
    } else {
      console.log('✅ Tabela credit_sales criada com sucesso');
    }
    
    // Agora criar a tabela credit_sale_items
    console.log('📝 Criando tabela credit_sale_items...');
    const createCreditItemsQuery = `
      CREATE TABLE IF NOT EXISTS credit_sale_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all operations" ON credit_sale_items;
      CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);
    `;
    
    const { data: result2, error: error2 } = await supabase.rpc('exec_sql', {
      sql: createCreditItemsQuery
    });
    
    if (error2) {
      console.log('❌ Erro ao criar credit_sale_items:', error2.message);
    } else {
      console.log('✅ Tabela credit_sale_items criada com sucesso');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log('📝 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o conteúdo do arquivo create-credit-sales-tables.sql');
  }
}

// Executar
createCreditSalesTables().then(() => {
  console.log('✅ Processo concluído');
}).catch(error => {
  console.log('❌ Erro:', error.message);
});