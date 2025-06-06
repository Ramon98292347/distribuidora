// Teste final de conexão com o Supabase usando as credenciais atualizadas
import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';

// Usando as credenciais atualizadas
const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase usando as credenciais atualizadas...');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Chave: ${SUPABASE_KEY.substring(0, 20)}...`);
  
  try {
    // Criar cliente Supabase com configuração para Node.js
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        fetch: fetch
      },
      auth: {
        persistSession: false
      }
    });
    
    console.log('Cliente Supabase criado com sucesso!');
    
    // Testar uma consulta simples primeiro
    console.log('Tentando fazer uma consulta básica...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`Erro na consulta: ${error.message}`);
      console.log(`Código do erro: ${error.code}`);
      console.log(`Detalhes: ${error.details}`);
    } else {
      console.log('Consulta bem-sucedida!');
      console.log('Dados retornados:', data);
    }
    
    // Testar outras tabelas se a primeira funcionou
    if (!error) {
      console.log('Testando tabela de clientes...');
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (clientsError) {
        console.log(`Erro ao buscar clientes: ${clientsError.message}`);
      } else {
        console.log('Clientes encontrados:', clients);
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testSupabaseConnection();