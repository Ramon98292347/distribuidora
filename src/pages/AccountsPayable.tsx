import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AccountsPayable, AccountsPayableFilters } from '@/types/accountsPayable';
import { getCurrentMonthValue, getMonthRange, loadAccountsPayable, resolveStatus, saveAccountsPayable } from '@/utils/accountsPayable';
import { CheckCircle2, Trash2 } from 'lucide-react';

const defaultForm = {
  description: '',
  supplier: '',
  category: '',
  value: '',
  dueDate: '',
  notes: '',
};

const AccountsPayablePage = () => {
  const [items, setItems] = useState<AccountsPayable[]>(() => loadAccountsPayable());
  const [form, setForm] = useState(defaultForm);
  const [filters, setFilters] = useState<AccountsPayableFilters>({
    month: getCurrentMonthValue(),
    status: 'todas',
    category: '',
    supplier: '',
  });

  const updateItems = (nextItems: AccountsPayable[]) => {
    const resolved = nextItems.map(resolveStatus);
    setItems(resolved);
    saveAccountsPayable(resolved);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.description || !form.supplier || !form.category || !form.dueDate || !form.value) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Preencha descricao, fornecedor, categoria, valor e vencimento.',
        variant: 'destructive',
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const newItem: AccountsPayable = resolveStatus({
      id: crypto.randomUUID(),
      description: form.description.trim(),
      supplier: form.supplier.trim(),
      category: form.category.trim(),
      value: Number(form.value),
      dueDate: form.dueDate,
      status: 'aberta',
      notes: form.notes.trim() || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    updateItems([newItem, ...items]);
    setForm(defaultForm);
    toast({ title: 'Conta cadastrada', description: 'Conta a pagar adicionada com sucesso.' });
  };

  const markAsPaid = (id: string) => {
    const nowDate = new Date().toISOString().slice(0, 10);
    updateItems(items.map((item) => (item.id === id ? { ...item, status: 'paga', paymentDate: nowDate, updatedAt: new Date().toISOString() } : item)));
  };

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  };

  const filteredItems = useMemo(() => {
    const { start, end } = getMonthRange(filters.month);

    return items
      .map(resolveStatus)
      .filter((item) => item.dueDate >= start && item.dueDate <= end)
      .filter((item) => (filters.status === 'todas' ? true : item.status === filters.status))
      .filter((item) => (filters.category ? item.category.toLowerCase().includes(filters.category.toLowerCase()) : true))
      .filter((item) => (filters.supplier ? item.supplier.toLowerCase().includes(filters.supplier.toLowerCase()) : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filters, items]);

  const monthOutput = useMemo(() => {
    const paid = filteredItems.filter((item) => item.status === 'paga').reduce((sum, item) => sum + item.value, 0);
    const open = filteredItems.filter((item) => item.status !== 'paga').reduce((sum, item) => sum + item.value, 0);
    const overdue = filteredItems.filter((item) => item.status === 'vencida').reduce((sum, item) => sum + item.value, 0);
    return { paid, open, overdue };
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
        <p className="text-gray-600">Cadastre e acompanhe suas saidas com vencimento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Saidas Pagas no Mes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">R$ {monthOutput.paid.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Saidas em Aberto no Mes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">R$ {monthOutput.open.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Saidas Vencidas no Mes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">R$ {monthOutput.overdue.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Nova Conta</CardTitle>
          <CardDescription>Registre uma nova conta com vencimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Descricao</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fornecedor</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
              <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Observacao</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <Button type="submit">Cadastrar Conta</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Filtro do Mes Vigente</CardTitle>
          <CardDescription>Filtre todas as saidas do periodo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value || getCurrentMonthValue() })} />
            <Select value={filters.status} onValueChange={(value: AccountsPayableFilters['status']) => setFilters({ ...filters, status: value })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Categoria" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
            <Input placeholder="Fornecedor" value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Contas do Periodo</CardTitle>
          <CardDescription>{filteredItems.length} registro(s) encontrado(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg border bg-white">
                <div>
                  <p className="font-semibold text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-600">{item.supplier} | {item.category}</p>
                  <p className="text-sm text-gray-600">Vencimento: {new Date(item.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900">R$ {item.value.toFixed(2)}</p>
                  <Badge variant={item.status === 'paga' ? 'default' : item.status === 'vencida' ? 'destructive' : 'secondary'}>{item.status}</Badge>
                  {item.status !== 'paga' && (
                    <Button variant="outline" size="sm" onClick={() => markAsPaid(item.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />Quitar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && <p className="text-sm text-gray-500">Nenhuma conta encontrada para este filtro.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPayablePage;
