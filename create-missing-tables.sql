-- Script para criar tabelas que estavam faltando
-- Execute este SQL no SQL Editor do Supabase

-- 1. TABELA DE USUÁRIOS
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

-- 2. TABELA DE COMPRAS (PURCHASES)
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

-- 3. TABELA DE ITENS DE COMPRA (PURCHASE_ITEMS)
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

-- 4. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'adjustment', etc.
    reference_id UUID, -- ID da venda, compra, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 5. TABELA DE CATEGORIAS DE PRODUTOS
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 7. CRIAR TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_items_updated_at BEFORE UPDATE ON purchase_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. HABILITAR RLS E CRIAR POLÍTICAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON purchase_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_categories FOR ALL USING (true);

-- 9. INSERIR DADOS DE EXEMPLO

-- Categorias de produtos
INSERT INTO product_categories (name, description) VALUES
('Refrigerantes', 'Bebidas gaseificadas e refrigerantes'),
('Cervejas', 'Bebidas alcoólicas fermentadas'),
('Águas', 'Águas minerais e com gás'),
('Sucos', 'Sucos naturais e industrializados'),
('Energéticos', 'Bebidas energéticas')
ON CONFLICT (name) DO NOTHING;

-- Usuário administrador padrão
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@jeserbebidas.com', '$2b$10$example_hash_here', 'Administrador', 'admin'),
('gerente@jeserbebidas.com', '$2b$10$example_hash_here', 'Gerente', 'manager'),
('vendedor@jeserbebidas.com', '$2b$10$example_hash_here', 'Vendedor', 'user')
ON CONFLICT (email) DO NOTHING;

-- Compra de exemplo
INSERT INTO purchases (supplier_name, supplier_contact, purchase_date, total_amount, status, notes) VALUES
('Distribuidora Coca-Cola', 'contato@cocacola.com', CURRENT_DATE - INTERVAL '7 days', 1500.00, 'completed', 'Compra semanal de refrigerantes'),
('Cervejaria Ambev', 'vendas@ambev.com', CURRENT_DATE - INTERVAL '3 days', 2200.00, 'completed', 'Reposição de cervejas')
ON CONFLICT DO NOTHING;

-- Verificar criação das tabelas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'purchases', 'purchase_items', 'stock_movements', 'product_categories')
ORDER BY table_name;