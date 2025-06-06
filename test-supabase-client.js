// Teste de conexão com o Supabase usando a biblioteca oficial
import { createClient } from '@supabase/supabase-js';

// Usando as credenciais do arquivo de integração do projeto
const SUPABASE_URL = "https://visflgdxbccivhzjbohg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpc2ZsZ2R4YmNjaXZoempib2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzEwODYsImV4cCI6MjA2NDM0NzA4Nn0.2Vo4jmn3MkJavngC34pTJUxr-BzjOHfaz5dAlEtT11U";

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase usando a biblioteca oficial...');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Chave: ${SUPABASE_KEY.substring(0, 10)}...`);
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Testar conexão com a tabela products
    console.log('Tentando buscar produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count');
    
    if (productsError) {
      throw new Error(`Erro ao buscar produtos: ${productsError.message}`);
    }
    
    console.log('Produtos encontrados:', products);
    
    // Testar conexão com a tabela clients
    console.log('Tentando buscar clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('count');
    
    if (clientsError) {
      console.log(`Aviso: Erro ao buscar clientes: ${clientsError.message}`);
    } else {
      console.log('Clientes encontrados:', clients);
    }
    
    console.log('Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
  }
}

testSupabaseConnection();