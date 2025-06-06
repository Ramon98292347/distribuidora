import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase/client';

interface ProductImageUploadProps {
  productId: string;
  onImageUploaded?: (imageUrl: string) => void;
  maxImages?: number;
  existingImages?: ProductImage[];
}

interface ProductImage {
  id: string;
  image_url: string;
  image_name: string;
  is_primary: boolean;
  alt_text?: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  productId,
  onImageUploaded,
  maxImages = 5,
  existingImages = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB.');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Salvar informações no banco de dados
      const { data: dbData, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          image_name: file.name,
          image_size: file.size,
          image_type: file.type,
          is_primary: images.length === 0, // Primeira imagem é primária
          alt_text: `Imagem do produto ${productId}`
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Atualizar estado local
      const newImage: ProductImage = {
        id: dbData.id,
        image_url: imageUrl,
        image_name: file.name,
        is_primary: images.length === 0
      };

      setImages(prev => [...prev, newImage]);
      onImageUploaded?.(imageUrl);

      alert('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar imagem:', error);
      alert(`Erro ao enviar imagem: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extrair caminho do arquivo da URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `product-images/${fileName}`;

      // Deletar do Storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (storageError) {
        console.warn('Erro ao deletar do storage:', storageError);
      }

      // Deletar do banco de dados
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        throw dbError;
      }

      // Atualizar estado local
      setImages(prev => prev.filter(img => img.id !== imageId));
      alert('Imagem removida com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      alert(`Erro ao deletar imagem: ${error.message}`);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // Remover primária de todas as imagens
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      // Definir nova imagem primária
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));

      alert('Imagem primária definida!');
    } catch (error: any) {
      console.error('Erro ao definir imagem primária:', error);
      alert(`Erro ao definir imagem primária: ${error.message}`);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    filesToUpload.forEach(file => uploadImage(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="product-image-upload">
      <h3>Imagens do Produto ({images.length}/{maxImages})</h3>
      
      {/* Área de Upload */}
      {images.length < maxImages && (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragOver ? '#f0f8ff' : '#fafafa',
            marginBottom: '20px'
          }}
        >
          {uploading ? (
            <div>
              <div>📤</div>
              <p>Enviando imagem...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
              <p>Clique aqui ou arraste imagens para enviar</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Máximo {maxImages - images.length} imagens restantes • Máximo 5MB por imagem
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Lista de Imagens */}
      {images.length > 0 && (
        <div className="images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {images.map((image) => (
            <div key={image.id} className="image-item" style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={image.image_url}
                  alt={image.alt_text || image.image_name}
                  style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                />
                {image.is_primary && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    PRINCIPAL
                  </div>
                )}
              </div>
              
              <div style={{ padding: '8px' }}>
                <p style={{ fontSize: '12px', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                  {image.image_name}
                </p>
                
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {!image.is_primary && (
                    <button
                      onClick={() => setPrimaryImage(image.id)}
                      style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Definir Principal
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteImage(image.id, image.image_url)}
                    style={{
                      fontSize: '10px',
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;