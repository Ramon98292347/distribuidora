import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase
const supabaseUrl = 'https://urrnifahjrtxvgdrjdth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycm5pZmFoanJ0eHZnZHJqZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDcxMjQsImV4cCI6MjA2NDgyMzEyNH0.jzdyzypPXzPva_5mBzslLAGaQ9PWbv5JHiLtfbyuUi4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Criando tabelas no Supabase...');
  
  try {
    // Criar tabela de produtos
    console.log('📦 Criando tabela products...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          category VARCHAR(100),
          barcode VARCHAR(50),
          supplier VARCHAR(255),
          cost_price DECIMAL(10,2),
          profit_margin DECIMAL(5,2),
          min_stock_level INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (productsError) {
      console.log('⚠️ Erro ao criar tabela products:', productsError.message);
    } else {
      console.log('✅ Tabela products criada com sucesso');
    }
    
    // Criar tabela de clientes
    console.log('👥 Criando tabela clients...');
    const { error: clientsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(50),
          zip_code VARCHAR(20),
          document_number VARCHAR(50),
          client_type VARCHAR(20) DEFAULT 'individual',
          credit_limit DECIMAL(10,2) DEFAULT 0,
          current_debt DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (clientsError) {
      console.log('⚠️ Erro ao criar tabela clients:', clientsError.message);
    } else {
      console.log('✅ Tabela clients criada com sucesso');
    }
    
    // Criar tabela de vendas
    console.log('💰 Criando tabela sales...');
    const { error: salesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES clients(id),
          sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          total_amount DECIMAL(10,2) NOT NULL,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          tax_amount DECIMAL(10,2) DEFAULT 0,
          payment_method VARCHAR(50),
          payment_status VARCHAR(20) DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (salesError) {
      console.log('⚠️ Erro ao criar tabela sales:', salesError.message);
    } else {
      console.log('✅ Tabela sales criada com sucesso');
    }
    
    // Criar tabela de itens de venda
    console.log('📋 Criando tabela sale_items...');
    const { error: saleItemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sale_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id),
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (saleItemsError) {
      console.log('⚠️ Erro ao criar tabela sale_items:', saleItemsError.message);
    } else {
      console.log('✅ Tabela sale_items criada com sucesso');
    }
    
    // Inserir dados de exemplo
    console.log('📝 Inserindo dados de exemplo...');
    
    // Produtos de exemplo
    const { error: insertProductsError } = await supabase
      .from('products')
      .insert([
        {
          name: 'Coca-Cola 350ml',
          description: 'Refrigerante Coca-Cola lata 350ml',
          price: 3.50,
          stock_quantity: 100,
          category: 'Refrigerantes',
          cost_price: 2.00,
          profit_margin: 75.00
        },
        {
          name: 'Guaraná Antarctica 350ml',
          description: 'Refrigerante Guaraná Antarctica lata 350ml',
          price: 3.00,
          stock_quantity: 80,
          category: 'Refrigerantes',
          cost_price: 1.80,
          profit_margin: 66.67
        },
        {
          name: 'Água Mineral 500ml',
          description: 'Água mineral natural 500ml',
          price: 2.00,
          stock_quantity: 200,
          category: 'Águas',
          cost_price: 1.00,
          profit_margin: 100.00
        },
        {
          name: 'Cerveja Skol 350ml',
          description: 'Cerveja Skol lata 350ml',
          price: 4.50,
          stock_quantity: 150,
          category: 'Cervejas',
          cost_price: 2.50,
          profit_margin: 80.00
        },
        {
          name: 'Suco de Laranja 1L',
          description: 'Suco de laranja natural 1 litro',
          price: 8.00,
          stock_quantity: 50,
          category: 'Sucos',
          cost_price: 5.00,
          profit_margin: 60.00
        }
      ]);
    
    if (insertProductsError) {
      console.log('⚠️ Erro ao inserir produtos:', insertProductsError.message);
    } else {
      console.log('✅ Produtos de exemplo inseridos');
    }
    
    // Clientes de exemplo
    const { error: insertClientsError } = await supabase
      .from('clients')
      .insert([
        {
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          address: 'Rua das Flores, 123',
          document_number: '123.456.789-00',
          client_type: 'individual'
        },
        {
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 88888-8888',
          address: 'Av. Principal, 456',
          document_number: '987.654.321-00',
          client_type: 'individual'
        },
        {
          name: 'Empresa ABC Ltda',
          email: 'contato@empresaabc.com',
          phone: '(11) 77777-7777',
          address: 'Rua Comercial, 789',
          document_number: '12.345.678/0001-90',
          client_type: 'company'
        }
      ]);
    
    if (insertClientsError) {
      console.log('⚠️ Erro ao inserir clientes:', insertClientsError.message);
    } else {
      console.log('✅ Clientes de exemplo inseridos');
    }
    
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    console.log('\n📊 Resumo:');
    
    // Verificar dados inseridos
    const { data: products, count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    const { data: clients, count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact' });
    
    console.log(`📦 Produtos: ${productsCount || 0}`);
    console.log(`👥 Clientes: ${clientsCount || 0}`);
    console.log(`💰 Vendas: 0 (pronto para usar)`);
    
    console.log('\n🚀 Aplicação pronta para uso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTables();