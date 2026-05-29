
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wine, ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Receipt = () => {
  const { saleId } = useParams();
  const { getSaleById } = useData();
  const navigate = useNavigate();

  const sale = getSaleById(saleId || '');

  if (!sale) {
    return (
      <Card className="shadow-lg border-0 border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Recibo n�o encontrado
          </h3>
          <p className="text-red-600 mb-4">
            O recibo solicitado n�o foi encontrado.
          </p>
          <Button onClick={() => navigate('/sales')} variant="outline">
            Voltar para Vendas
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCreditSale = 'clientId' in sale && 'isPaid' in sale;
  const isRegularSale = 'paymentMethod' in sale;

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impress�o",
      description: "O recibo ser� enviado para a impressora",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: "O recibo foi salvo como PDF",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* A��es */}
      <div className="flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/sales')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Recibo */}
      <Card className="shadow-lg border-0 print:shadow-none print:border print:border-gray-300">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white print:bg-white print:text-black">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full print:bg-gray-100">
              <Wine className="h-8 w-8 text-white print:text-gray-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            ComercialPro
          </CardTitle>
          <p className="text-blue-100 print:text-gray-600">
            Sua neg�cio de confian�a
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Informa��es da Venda */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg print:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-700">Data e Hora:</p>
              <p className="text-gray-900">{new Date(sale.date).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Recibo Nº:</p>
              <p className="text-gray-900">#{sale.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Tipo de Venda */}
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 print:bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Tipo de Venda:</span>
              <span className="font-semibold text-gray-900">
                {isCreditSale ? '📝 Venda Fiado' : '💰 Venda � Vista'}
              </span>
            </div>
            {isCreditSale && sale.clientName && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <span className="text-sm font-medium text-gray-700">Cliente: </span>
                <span className="text-sm text-gray-900">{sale.clientName}</span>
              </div>
            )}
            {isRegularSale && sale.clientName && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <span className="text-sm font-medium text-gray-700">Cliente: </span>
                <span className="text-sm text-gray-900">{sale.clientName}</span>
              </div>
            )}
          </div>

          {/* Produtos */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Produtos Vendidos
            </h3>
            
            <div className="space-y-3">
              {sale.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">
                      {product.quantity}x R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      R$ {(product.quantity * product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 print:bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total da Venda:</span>
              <span className="text-2xl font-bold text-green-600 print:text-gray-900">
                R$ {sale.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Forma de Pagamento (apenas para vendas � vista) */}
          {isRegularSale && (
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 print:bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Forma de Pagamento:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {sale.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : 
                   sale.paymentMethod === 'pix' ? '📱 PIX' : '💳 Cart�o'}
                </span>
              </div>
            </div>
          )}

          {/* Status da Venda Fiado */}
          {isCreditSale && (
            <div className="mb-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 print:bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`font-semibold ${sale.isPaid ? 'text-green-600' : 'text-orange-600'} print:text-gray-900`}>
                  {sale.isPaid ? '✅ Pago' : '⏳ Pendente'}
                </span>
              </div>
              {sale.description && (
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <span className="text-sm font-medium text-gray-700">Descri��o: </span>
                  <span className="text-sm text-gray-900">{sale.description}</span>
                </div>
              )}
              {sale.isPaid && sale.paidAt && (
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <span className="text-sm font-medium text-gray-700">Pago em: </span>
                  <span className="text-sm text-gray-900">{new Date(sale.paidAt).toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>
          )}

          {/* Mensagem de Agradecimento */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg print:bg-gray-100 print:text-gray-900">
            <h3 className="text-lg font-semibold mb-2">
              🙏 Obrigado pela prefer�ncia!
            </h3>
            <p className="text-sm">
              {isCreditSale && !sale.isPaid 
                ? 'Aguardamos o pagamento. A ComercialPro agradece sua confian�a.'
                : 'Volte sempre. A ComercialPro agradece sua confian�a.'
              }
            </p>
          </div>

          {/* Rodap� */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Este recibo foi gerado automaticamente pelo sistema</p>
            <p>ComercialPro - Sistema de Gest�o v1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipt;


