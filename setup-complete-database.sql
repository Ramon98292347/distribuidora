-- Script completo para configurar o banco de dados do Jeser Bebidas
-- Execute este SQL no SQL Editor do Supabase para resolver todos os problemas

-- =====================================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_images DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CRIAR TABELAS PRINCIPAIS (SE NÃO EXISTIREM)
-- =====================================================

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category VARCHAR(100),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    profit_margin DECIMAL(5,2) CHECK (profit_margin >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    document_number VARCHAR(20),
    client_type VARCHAR(20) DEFAULT 'individual' CHECK (client_type IN ('individual', 'company')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens de produtos
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    image_size INTEGER,
    image_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAR TABELAS ADICIONAIS
-- =====================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(255),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de compra
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);

-- =====================================================
-- 5. CRIAR TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sale_items_updated_at ON sale_items;
CREATE TRIGGER update_sale_items_updated_at BEFORE UPDATE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_items_updated_at ON purchase_items;
CREATE TRIGGER update_purchase_items_updated_at BEFORE UPDATE ON purchase_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INSERIR DADOS DE EXEMPLO
-- =====================================================

-- Categorias de produtos
INSERT INTO product_categories (name, description) VALUES
('Refrigerantes', 'Bebidas gaseificadas e refrigerantes'),
('Cervejas', 'Bebidas alcoólicas fermentadas'),
('Águas', 'Águas minerais e com gás'),
('Sucos', 'Sucos naturais e industrializados'),
('Energéticos', 'Bebidas energéticas')
ON CONFLICT (name) DO NOTHING;

-- Produtos
INSERT INTO products (name, description, price, stock_quantity, category, cost_price, profit_margin) VALUES
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

-- Clientes
INSERT INTO clients (name, email, phone, address, document_number, client_type) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Rua das Flores, 123', '123.456.789-00', 'individual'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Av. Principal, 456', '987.654.321-00', 'individual'),
('Empresa ABC Ltda', 'contato@empresaabc.com', '(11) 77777-7777', 'Rua Comercial, 789', '12.345.678/0001-90', 'company'),
('Pedro Oliveira', 'pedro@email.com', '(11) 77777-7777', 'Rua das Palmeiras, 321', '456.789.123-00', 'individual'),
('Ana Costa', 'ana@email.com', '(11) 66666-6666', 'Av. Secundária, 654', '789.123.456-00', 'individual'),
('Distribuidora XYZ', 'vendas@xyz.com', '(11) 55555-5555', 'Rua Industrial, 987', '98.765.432/0001-10', 'company')
ON CONFLICT (id) DO NOTHING;

-- Usuários
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@jeserbebidas.com', '$2b$10$example_hash_here', 'Administrador', 'admin'),
('gerente@jeserbebidas.com', '$2b$10$example_hash_here', 'Gerente', 'manager'),
('vendedor@jeserbebidas.com', '$2b$10$example_hash_here', 'Vendedor', 'user')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 7. CONFIGURAR RLS COM POLÍTICAS PERMISSIVAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_images;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchases;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_categories;

DROP POLICY IF EXISTS "Allow all operations" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON clients;
DROP POLICY IF EXISTS "Allow all operations" ON sales;
DROP POLICY IF EXISTS "Allow all operations" ON sale_items;
DROP POLICY IF EXISTS "Allow all operations" ON product_images;
DROP POLICY IF EXISTS "Allow all operations" ON users;
DROP POLICY IF EXISTS "Allow all operations" ON purchases;
DROP POLICY IF EXISTS "Allow all operations" ON purchase_items;
DROP POLICY IF EXISTS "Allow all operations" ON stock_movements;
DROP POLICY IF EXISTS "Allow all operations" ON product_categories;

-- Criar políticas permissivas para desenvolvimento
CREATE POLICY "Allow all operations for development" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON purchase_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for development" ON product_categories FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 8. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'Tabelas criadas:' as info,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'products', 'clients', 'sales', 'sale_items', 'product_images',
    'users', 'purchases', 'purchase_items', 'stock_movements', 'product_categories'
);

-- Mostrar contagem de registros
SELECT 'Produtos cadastrados:' as info, COUNT(*) as total FROM products;
SELECT 'Clientes cadastrados:' as info, COUNT(*) as total FROM clients;
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM users;
SELECT 'Categorias cadastradas:' as info, COUNT(*) as total FROM product_categories;

-- Mostrar alguns produtos
SELECT 
    name, 
    price, 
    stock_quantity, 
    category 
FROM products 
LIMIT 5;

-- Mensagem de sucesso
SELECT '🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO! 🎉' as status;
SELECT 'Todas as tabelas foram criadas e populadas com dados de exemplo.' as info;
SELECT 'O sistema está pronto para uso!' as info;