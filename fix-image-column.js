import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixImageColumn() {
  try {
    console.log('🔄 Conectando ao Supabase...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./fix-image-column.sql', 'utf8');
    console.log('📄 Arquivo SQL lido com sucesso!');
    
    console.log('⚠️ A função exec_sql não está disponível no Supabase. Você precisa executar o SQL manualmente.');
    console.log('\n📝 INSTRUÇÕES PARA CORREÇÃO MANUAL:');
    console.log('Siga estas etapas para adicionar a coluna "image" na tabela "products":');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor"');
    console.log('4. Crie um novo script SQL');
    console.log('5. Cole o conteúdo abaixo:');
    console.log('\n' + sqlContent);
    console.log('\n6. Clique em "Run" para executar o SQL');
    
    console.log('\nAlternativamente, você pode usar o Editor de Tabelas:');
    console.log('1. Vá para "Table Editor" > "products"');
    console.log('2. Clique em "Edit table"');
    console.log('3. Adicione uma nova coluna chamada "image" do tipo "text"');
    console.log('4. Clique em "Save"');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a função
fixImageColumn();