import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const SUPABASE_URL = "https://urrnifahjrtxvgdrjdth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixStockColumn() {
  try {
    console.log('🔄 Conectando ao Supabase...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./fix-stock-column.sql', 'utf8');
    console.log('📄 Arquivo SQL lido com sucesso!');
    
    // Executar o SQL para corrigir a coluna stock
    console.log('🔧 Executando SQL para corrigir a coluna stock...');
    
    // Dividir o SQL em comandos separados
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim() + ';';
      console.log(`⚙️ Executando comando ${i+1} de ${sqlCommands.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erro ao executar comando ${i+1}:`, error.message);
        } else {
          console.log(`✅ Comando ${i+1} executado com sucesso!`);
        }
      } catch (cmdError) {
        console.error(`❌ Erro ao executar comando ${i+1}:`, cmdError.message);
      }
    }
    
    // Verificar se a coluna stock existe agora
    console.log('🔍 Verificando se a coluna stock existe...');
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock';"
    });
    
    if (error) {
      console.error('❌ Erro ao verificar coluna:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log('✅ Coluna stock encontrada! A correção foi aplicada com sucesso.');
      } else {
        console.log('⚠️ Coluna stock não encontrada. A correção pode não ter funcionado.');
      }
    }
    
    // Instruções para o usuário
    console.log('\n📝 INSTRUÇÕES PARA CORREÇÃO MANUAL:');
    console.log('Se o script não conseguiu corrigir o problema automaticamente, siga estas etapas:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "Table Editor" > "products"');
    console.log('4. Clique em "Edit table"');
    console.log('5. Renomeie a coluna "stock_quantity" para "stock"');
    console.log('6. Clique em "Save"');
    console.log('\nAlternativamente, execute este SQL no "SQL Editor":');
    console.log('ALTER TABLE products RENAME COLUMN stock_quantity TO stock;');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a função
fixStockColumn();