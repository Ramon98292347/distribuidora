
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Image } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface FormData {
  name: string;
  price: string;
  stock: string;
  image?: string;
}

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isAdmin: boolean;
}

const ProductDialog = ({
  isOpen,
  onOpenChange,
  editingProduct,
  formData,
  onFormDataChange,
  onSubmit,
  onReset,
  isAdmin
}: ProductDialogProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        onFormDataChange({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    onFormDataChange({ ...formData, image: undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? 'Atualize as informações do produto' : 'Adicione um novo produto ao estoque'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="Ex: Cerveja Skol 350ml"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço de Venda (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Quantidade em Estoque</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => onFormDataChange({ ...formData, stock: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            {(previewImage || formData.image) ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={previewImage || formData.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    Remover
                  </Button>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Adicionar imagem do produto</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              {editingProduct ? 'Atualizar' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;

