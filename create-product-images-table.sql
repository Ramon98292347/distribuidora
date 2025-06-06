-- Script para criar a tabela de fotos dos produtos
-- Execute este script no SQL Editor do Supabase

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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Política de segurança
CREATE POLICY "Enable all operations for authenticated users" ON product_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Dados de exemplo (opcional)
-- Substitua os UUIDs pelos IDs reais dos seus produtos
/*
INSERT INTO product_images (product_id, image_url, image_name, image_type, is_primary, alt_text) VALUES
('product-uuid-1', 'https://example.com/images/coca-cola.jpg', 'coca-cola.jpg', 'image/jpeg', true, 'Coca-Cola 350ml'),
('product-uuid-2', 'https://example.com/images/guarana.jpg', 'guarana.jpg', 'image/jpeg', true, 'Guaraná Antarctica 350ml'),
('product-uuid-3', 'https://example.com/images/agua.jpg', 'agua.jpg', 'image/jpeg', true, 'Água Mineral 500ml');
*/

-- Verificar se a tabela foi criada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'product_images';