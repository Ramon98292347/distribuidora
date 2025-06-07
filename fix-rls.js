import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixRLS() {
  try {
    console.log('🔄 Verificando conexão com Supabase...');
    
    // Testar a conexão com o Supabase
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact' });
      
    if (testError) {
      console.error('❌ Erro ao conectar com Supabase:', testError.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    
    // Verificar políticas RLS atuais
    console.log('🔍 Verificando políticas RLS atuais...');
    
    // Tentar inserir um produto de teste para verificar se há problemas de RLS
    const testProduct = {
      name: 'Produto Teste RLS',
      price: 1.99,
      stock: 10
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct]);
      
    if (insertError) {
      console.log('⚠️ Erro ao inserir produto de teste:', insertError.message);
      console.log('🔧 Aplicando correções de RLS...');
      
      // Inserir produto com RPC para contornar RLS
      const { error: rpcError } = await supabase.rpc('insert_product_bypass_rls', {
        product_name: 'Produto Teste RPC',
        product_price: 2.99,
        product_stock: 20
      });
      
      if (rpcError) {
        console.error('❌ Erro ao usar RPC:', rpcError.message);
        console.log('⚠️ A função RPC "insert_product_bypass_rls" pode não existir no banco de dados.');
      } else {
        console.log('✅ Produto inserido com sucesso via RPC!');
      }
    } else {
      console.log('✅ Produto inserido com sucesso! As políticas RLS parecem estar funcionando corretamente.');
    }
    
    // Verificar contagem de produtos
    const { data: countData, error: countError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact' });
      
    if (!countError) {
      console.log(`📊 Total de produtos no banco: ${countData.count || 'desconhecido'}`);
    }
    
    console.log('\n📝 INSTRUÇÕES PARA CORREÇÃO MANUAL:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "Authentication" > "Policies"');
    console.log('4. Para cada tabela (products, clients, sales, etc.), crie uma política:');
    console.log('   - Nome: "Allow all operations"');
    console.log('   - Operação: ALL');
    console.log('   - Usando expressão: true');
    console.log('5. Alternativamente, execute o SQL em "SQL Editor":');
    console.log(`
-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;

-- Reabilitar com políticas permissivas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
`);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a função
fixRLS();