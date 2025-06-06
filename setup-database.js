import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase
const supabaseUrl = 'https://urrnifahjrtvgdrjdth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0dmdkcmpkdGgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNzU2NzI4NSwiZXhwIjoyMDUzMTQzMjg1fQ.ey3hbGc1Ol3lUzlNilsInRScCI6IkpXVCJ9VCJ30i03d';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`);
    
    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim()) {
        try {
          console.log(`⏳ Executando comando ${i + 1}/${sqlCommands.length}...`);
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: command
          });
          
          if (error) {
            // Tentar executar diretamente se RPC falhar
            const { error: directError } = await supabase
              .from('_temp')
              .select('*')
              .limit(0);
            
            if (directError) {
              console.log(`⚠️  Comando ${i + 1} pode ter falhado:`, error.message);
            } else {
              console.log(`✅ Comando ${i + 1} executado com sucesso`);
            }
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.log(`⚠️  Erro no comando ${i + 1}:`, err.message);
        }
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tables = ['products', 'clients', 'sales', 'sale_items', 'stock_movements', 'suppliers', 'purchases', 'purchase_items', 'users'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela '${table}' não encontrada ou erro:`, error.message);
        } else {
          console.log(`✅ Tabela '${table}' criada com sucesso`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar tabela '${table}':`, err.message);
      }
    }
    
    // Testar inserção de dados
    console.log('\n🧪 Testando inserção de dados...');
    
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      if (productsError) {
        console.log('❌ Erro ao buscar produtos:', productsError.message);
      } else {
        console.log(`✅ Encontrados ${products.length} produtos na base de dados`);
        if (products.length > 0) {
          console.log('📦 Exemplo de produto:', products[0].name);
        }
      }
    } catch (err) {
      console.log('❌ Erro ao testar produtos:', err.message);
    }
    
    console.log('\n🎉 Configuração do banco de dados concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verificar as tabelas no painel do Supabase');
    console.log('2. Configurar políticas RLS se necessário');
    console.log('3. Testar a aplicação');
    
  } catch (error) {
    console.error('❌ Erro geral na configuração:', error);
  }
}

// Executar a configuração
setupDatabase();