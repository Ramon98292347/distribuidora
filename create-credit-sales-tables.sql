-- Criar tabelas para vendas fiado (credit sales)

-- 1. TABELA DE VENDAS FIADO (CREDIT_SALES)
CREATE TABLE IF NOT EXISTS credit_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE ITENS DE VENDA FIADO (CREDIT_SALE_ITEMS)
CREATE TABLE IF NOT EXISTS credit_sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE PAGAMENTOS DE VENDAS FIADO (CREDIT_SALE_PAYMENTS)
CREATE TABLE IF NOT EXISTS credit_sale_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'pix', 'card', 'transfer')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_credit_sales_client_id ON credit_sales(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_status ON credit_sales(status);
CREATE INDEX IF NOT EXISTS idx_credit_sales_due_date ON credit_sales(due_date);
CREATE INDEX IF NOT EXISTS idx_credit_sale_items_credit_sale_id ON credit_sale_items(credit_sale_id);
CREATE INDEX IF NOT EXISTS idx_credit_sale_items_product_id ON credit_sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_credit_sale_payments_credit_sale_id ON credit_sale_payments(credit_sale_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_sales_updated_at BEFORE UPDATE ON credit_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS e criar políticas
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_payments ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sale_payments FOR ALL USING (true);

-- Verificar criação das tabelas
SELECT 'Tabelas de vendas fiado criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('credit_sales', 'credit_sale_items', 'credit_sale_payments')
ORDER BY table_name;