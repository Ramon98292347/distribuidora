import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  AccountsPayable,
  AccountsPayableFilters,
  AccountsPayablePaymentMethod,
  AccountsPayableStatus,
} from '@/types/accountsPayable';
import { getCurrentMonthValue, getMonthRange, resolveStatusByDate, toDateString } from '@/utils/accountsPayable';
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const defaultForm = {
  description: '',
  supplier: '',
  category: '',
  value: '',
  dueDate: '',
  notes: '',
};

const paymentMethods: { value: AccountsPayablePaymentMethod; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cart�o de D�bito' },
  { value: 'cartao_credito', label: 'Cart�o de Cr�dito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transfer�ncia' },
  { value: 'outro', label: 'Outro' },
];

const AccountsPayablePage = () => {
  const [items, setItems] = useState<AccountsPayable[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<AccountsPayablePaymentMethod>('pix');

  const [filters, setFilters] = useState<AccountsPayableFilters>({
    month: getCurrentMonthValue(),
    status: 'todas',
    category: '',
    supplier: '',
  });

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('accounts_payable').select('*').order('due_date', { ascending: true });

    if (error) {
      toast({ title: 'Erro ao carregar contas', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const mapped: AccountsPayable[] = (data || []).map((item) => ({
      id: item.id,
      description: item.description,
      supplier: item.supplier,
      category: item.category,
      value: Number(item.value),
      dueDate: item.due_date,
      status: resolveStatusByDate(item.status as AccountsPayableStatus, item.due_date),
      paymentDate: item.payment_date,
      paymentMethod: (item.payment_method as AccountsPayablePaymentMethod | null) ?? null,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    setItems(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.description || !form.supplier || !form.category || !form.dueDate || !form.value) {
      toast({
        title: 'Campos obrigat�rios',
        description: 'Preencha descri��o, fornecedor, categoria, valor e vencimento.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const payload = {
      description: form.description.trim(),
      supplier: form.supplier.trim(),
      category: form.category.trim(),
      value: Number(form.value),
      due_date: form.dueDate,
      notes: form.notes.trim() || null,
      status: resolveStatusByDate('aberta', form.dueDate),
    };

    const query = editingId
      ? supabase.from('accounts_payable').update(payload).eq('id', editingId)
      : supabase.from('accounts_payable').insert(payload);

    const { error } = await query;
    setSaving(false);

    if (error) {
      toast({ title: 'Erro ao salvar conta', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: editingId ? 'Conta atualizada' : 'Conta cadastrada', description: 'Opera��o realizada com sucesso.' });
    resetForm();
    await loadItems();
  };

  const handleEdit = (item: AccountsPayable) => {
    setEditingId(item.id);
    setForm({
      description: item.description,
      supplier: item.supplier,
      category: item.category,
      value: item.value.toString(),
      dueDate: item.dueDate,
      notes: item.notes || '',
    });
  };

  const markAsPaid = async (id: string) => {
    const nowDate = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('accounts_payable')
      .update({ status: 'paga', payment_date: nowDate, payment_method: payMethod })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao quitar conta', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Conta quitada', description: 'Pagamento registrado com sucesso.' });
    await loadItems();
  };

  const cancelItem = async (id: string) => {
    const { error } = await supabase.from('accounts_payable').update({ status: 'cancelada' }).eq('id', id);

    if (error) {
      toast({ title: 'Erro ao cancelar conta', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Conta cancelada', description: 'Status atualizado para cancelada.' });
    await loadItems();
  };

  const filteredItems = useMemo(() => {
    const { start, end } = getMonthRange(filters.month);

    return items
      .filter((item) => item.dueDate >= start && item.dueDate <= end)
      .filter((item) => (filters.status === 'todas' ? true : item.status === filters.status))
      .filter((item) => (filters.category ? item.category.toLowerCase().includes(filters.category.toLowerCase()) : true))
      .filter((item) => (filters.supplier ? item.supplier.toLowerCase().includes(filters.supplier.toLowerCase()) : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filters, items]);

  const monthOutput = useMemo(() => {
    const paid = filteredItems.filter((item) => item.status === 'paga').reduce((sum, item) => sum + item.value, 0);
    const open = filteredItems.filter((item) => item.status === 'aberta' || item.status === 'vencida').reduce((sum, item) => sum + item.value, 0);
    const overdue = filteredItems.filter((item) => item.status === 'vencida').reduce((sum, item) => sum + item.value, 0);
    return { paid, open, overdue };
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
        <p className="text-gray-600">Controle financeiro das sa�das do neg�cio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pagas no M�s</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">R$ {monthOutput.paid.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Abertas no M�s</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">R$ {monthOutput.open.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vencidas no M�s</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">R$ {monthOutput.overdue.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Conta' : 'Nova Conta'}</CardTitle>
          <CardDescription>Registre despesas com vencimento e acompanhe o status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Descri��o</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fornecedor</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
              <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Observa��o</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Atualizar Conta' : 'Cadastrar Conta'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancelar edi��o</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre contas por per�odo, status, categoria e fornecedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value || getCurrentMonthValue() })} />
            <Select value={filters.status} onValueChange={(value: AccountsPayableFilters['status']) => setFilters({ ...filters, status: value })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Categoria" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
            <Input placeholder="Fornecedor" value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })} />
            <Select value={payMethod} onValueChange={(value: AccountsPayablePaymentMethod) => setPayMethod(value)}>
              <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Contas do Per�odo</CardTitle>
          <CardDescription>{filteredItems.length} registro(s) encontrado(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Carregando contas...</p>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-4 rounded-lg border bg-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600">{item.supplier} | {item.category}</p>
                      <p className="text-sm text-gray-600">Vencimento: {toDateString(item.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-900">R$ {item.value.toFixed(2)}</p>
                      <Badge variant={item.status === 'paga' ? 'default' : item.status === 'vencida' ? 'destructive' : 'secondary'}>{item.status}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(item.status === 'aberta' || item.status === 'vencida') && (
                      <Button variant="outline" size="sm" onClick={() => markAsPaid(item.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />Quitar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4 mr-2" />Editar
                    </Button>
                    {item.status !== 'cancelada' && (
                      <Button variant="outline" size="sm" onClick={() => cancelItem(item.id)} className="text-amber-700">
                        <XCircle className="h-4 w-4 mr-2" />Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && filteredItems.length === 0 && <p className="text-sm text-gray-500">Nenhuma conta encontrada para este filtro.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPayablePage;
