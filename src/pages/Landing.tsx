import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Store, ShieldCheck, BarChart3 } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-600" />
            <span className="font-semibold text-slate-900">ComercialPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/login?tab=register">
              <Button className="bg-orange-600 hover:bg-orange-700">Teste grátis por 7 dias</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="text-center space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Gestão completa para negócios
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Controle de estoque, vendas à vista e fiado, clientes e relatórios em uma única plataforma.
            Cada negócio com dados isolados e seguros.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/login?tab=register">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Começar teste grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mt-14">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Ambiente multiempresa seguro
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Cada administrador enxerga apenas o próprio negócio.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Operação centralizada
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Produtos, clientes, vendas e relatórios no mesmo painel.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                Teste grátis de 7 dias
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">
              Sem cartão de crédito no cadastro inicial.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Landing;
