-- Script para corrigir problemas do banco de dados
-- Execute este SQL no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA PERMITIR INSERÇÕES
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- 2. INSERIR DADOS DE EXEMPLO (caso não existam)
INSERT INTO products (name, description, price, stock_quantity, category, cost_price, profit_margin) 
VALUES
('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml', 3.50, 100, 'Refrigerantes', 2.00, 75.00),
('Guaraná Antarctica 350ml', 'Refrigerante Guaraná Antarctica lata 350ml', 3.00, 80, 'Refrigerantes', 1.80, 66.67),
('Água Mineral 500ml', 'Água mineral natural 500ml', 2.00, 200, 'Águas', 1.00, 100.00),
('Cerveja Skol 350ml', 'Cerveja Skol lata 350ml', 4.50, 150, 'Cervejas', 2.50, 80.00),
('Suco de Laranja 1L', 'Suco de laranja natural 1 litro', 8.00, 50, 'Sucos', 5.00, 60.00),
('Pepsi 350ml', 'Refrigerante Pepsi lata 350ml', 3.30, 90, 'Refrigerantes', 1.90, 73.68),
('Água com Gás 500ml', 'Água mineral com gás 500ml', 2.50, 120, 'Águas', 1.20, 108.33),
('Cerveja Brahma 350ml', 'Cerveja Brahma lata 350ml', 4.20, 130, 'Cervejas', 2.30, 82.61),
('Suco de Uva 1L', 'Suco de uva integral 1 litro', 9.50, 40, 'Sucos', 6.00, 58.33),
('Red Bull 250ml', 'Energético Red Bull lata 250ml', 8.90, 60, 'Energéticos', 5.50, 61.82)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (name, email, phone, address, document_number, client_type) 
VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Rua das Flores, 123', '123.456.789-00', 'individual'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Av. Principal, 456', '987.654.321-00', 'individual'),
('Empresa ABC Ltda', 'contato@empresaabc.com', '(11) 77777-7777', 'Rua Comercial, 789', '12.345.678/0001-90', 'company'),
('Pedro Oliveira', 'pedro@email.com', '(11) 77777-7777', 'Rua das Palmeiras, 321', '456.789.123-00', 'individual'),
('Ana Costa', 'ana@email.com', '(11) 66666-6666', 'Av. Secundária, 654', '789.123.456-00', 'individual'),
('Distribuidora XYZ', 'vendas@xyz.com', '(11) 55555-5555', 'Rua Industrial, 987', '98.765.432/0001-10', 'company')
ON CONFLICT (id) DO NOTHING;

-- 3. REABILITAR RLS COM POLÍTICAS MAIS PERMISSIVAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS MAIS PERMISSIVAS (PERMITIR ACESSO ANÔNIMO PARA DESENVOLVIMENTO)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_images;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_images FOR ALL USING (true);

-- 5. VERIFICAR SE TUDO FUNCIONOU
SELECT 'Produtos cadastrados:' as info, COUNT(*) as total FROM products;
SELECT 'Clientes cadastrados:' as info, COUNT(*) as total FROM clients;

-- Mostrar alguns produtos
SELECT name, price, stock_quantity, category FROM products LIMIT 5;