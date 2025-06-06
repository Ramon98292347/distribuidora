import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://urrnifahjrtxvgdrjdth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('🧪 Testando conexão com as tabelas do Supabase...');
  
  const tables = [
  'products', 
  'clients', 
  'sales', 
  'sale_items', 
  'product_images',
  'users',
  'purchases', 
  'purchase_items',
  'stock_movements',
  'product_categories'
];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabela '${table}': OK (${count || 0} registros)`);
        if (data && data.length > 0) {
          console.log(`   📄 Exemplo:`, Object.keys(data[0]).slice(0, 3).join(', '));
        }
      }
    } catch (err) {
      console.log(`❌ Erro ao testar '${table}':`, err.message);
    }
  }
  
  // Teste específico de produtos
  console.log('\n🛍️ Testando produtos especificamente...');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao buscar produtos:', error.message);
    } else {
      console.log(`✅ Produtos encontrados: ${products.length}`);
      products.forEach(product => {
        console.log(`   📦 ${product.name} - R$ ${product.price} (Estoque: ${product.stock_quantity})`);
      });
    }
  } catch (err) {
    console.log('❌ Erro no teste de produtos:', err.message);
  }
  
  // Teste de inserção
  console.log('\n➕ Testando inserção de produto...');
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: 'Produto Teste',
        description: 'Produto criado pelo script de teste',
        price: 1.99,
        stock_quantity: 10,
        category: 'Teste'
      })
      .select();
    
    if (error) {
      console.log('❌ Erro ao inserir produto teste:', error.message);
    } else {
      console.log('✅ Produto teste inserido com sucesso:', data[0].name);
      
      // Remover o produto teste
      await supabase
        .from('products')
        .delete()
        .eq('id', data[0].id);
      console.log('🗑️ Produto teste removido');
    }
  } catch (err) {
    console.log('❌ Erro no teste de inserção:', err.message);
  }
  
  console.log('\n🎉 Teste concluído!');
}

testTables();