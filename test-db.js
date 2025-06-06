// Teste de conexão com o Supabase
import fetch from 'cross-fetch';

// Usando as credenciais mostradas na imagem compartilhada pelo usuário
const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "ey3hbGc1Oi3JUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTM4NzgsImV4cCI6MjAzMjU2OTg3OH0";

async function testDatabase() {
  console.log('Testando conexão com o banco de dados Supabase...');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Chave: ${SUPABASE_KEY.substring(0, 10)}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Conexão bem-sucedida!');
    console.log('Dados recebidos:', data);
    
    // Testar outras tabelas
    const clientsResponse = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!clientsResponse.ok) {
      console.log(`Aviso: Tabela clients retornou status ${clientsResponse.status}`);
    } else {
      const clientsData = await clientsResponse.json();
      console.log('Dados de clientes:', clientsData);
    }
    
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error);
  }
}

testDatabase();