-- Execute este SQL no SQL Editor do Supabase
-- https://supabase.com/dashboard -> Seu Projeto -> SQL Editor

-- Tabela de produtos
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

-- Tabela de clientes
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

-- Tabela de vendas
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

-- Tabela de itens de venda
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

-- Tabela de fotos dos produtos
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    image_size INTEGER,
    image_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO products (name, description, price, stock_quantity, category, cost_price, profit_margin) VALUES
('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml', 3.50, 100, 'Refrigerantes', 2.00, 75.00),
('Guaraná Antarctica 350ml', 'Refrigerante Guaraná Antarctica lata 350ml', 3.00, 80, 'Refrigerantes', 1.80, 66.67),
('Água Mineral 500ml', 'Água mineral natural 500ml', 2.00, 200, 'Águas', 1.00, 100.00),
('Cerveja Skol 350ml', 'Cerveja Skol lata 350ml', 4.50, 150, 'Cervejas', 2.50, 80.00),
('Suco de Laranja 1L', 'Suco de laranja natural 1 litro', 8.00, 50, 'Sucos', 5.00, 60.00);

INSERT INTO clients (name, email, phone, address, document_number, client_type) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Rua das Flores, 123', '123.456.789-00', 'individual'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Av. Principal, 456', '987.654.321-00', 'individual'),
('Empresa ABC Ltda', 'contato@empresaabc.com', '(11) 77777-7777', 'Rua Comercial, 789', '12.345.678/0001-90', 'company');