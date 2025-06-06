# 🌐 Deploy da Aplicação Jeser Bebidas na Web

Este guia mostra como colocar a aplicação Jeser Bebidas online gratuitamente usando plataformas de hospedagem.

## 🚀 Opções de Deploy Gratuito

### 1. Vercel (Recomendado)

**Por que Vercel?**
- ✅ Integração nativa com Supabase
- ✅ Deploy automático via Git
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Domínio personalizado gratuito

**Passos para Deploy:**

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub/GitLab/Bitbucket

2. **Preparar o repositório**
   ```bash
   # Se ainda não tem Git configurado:
   git init
   git add .
   git commit -m "Initial commit"
   
   # Criar repositório no GitHub e fazer push
   git remote add origin https://github.com/seu-usuario/jeser-bebidas
   git push -u origin main
   ```

3. **Deploy no Vercel**
   - No Vercel, clique em "New Project"
   - Conecte seu repositório GitHub
   - Vercel detectará automaticamente que é um projeto Vite
   - Configure as variáveis de ambiente do Supabase:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Clique em "Deploy"

4. **Configurar domínio personalizado (opcional)**
   - No dashboard do projeto, vá em "Settings" > "Domains"
   - Adicione seu domínio personalizado

### 2. Netlify (Alternativa)

**Passos para Deploy:**

1. **Criar conta no Netlify**
   - Acesse: https://netlify.com
   - Faça login com GitHub

2. **Deploy via Git**
   - Clique em "New site from Git"
   - Conecte seu repositório
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Adicione as variáveis de ambiente do Supabase
   - Deploy!

### 3. GitHub Pages (Básico)

**Para projetos simples:**

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Adicionar scripts no package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://seu-usuario.github.io/jeser-bebidas"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Configurações Necessárias

### Variáveis de Ambiente

Crie um arquivo `.env.production` com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Configuração do Supabase

1. **Configurar URLs permitidas**
   - No Supabase Dashboard > Authentication > URL Configuration
   - Adicione sua URL de produção em:
     - Site URL: `https://seu-app.vercel.app`
     - Redirect URLs: `https://seu-app.vercel.app/**`

2. **Configurar CORS**
   - Adicione sua URL de produção nas configurações de CORS

## 📱 Recursos Disponíveis Online

### Funcionalidades que funcionarão:
- ✅ Gestão de produtos
- ✅ Gestão de clientes
- ✅ Registro de vendas
- ✅ Dashboard com métricas
- ✅ Upload de imagens (Supabase Storage)
- ✅ Backup e restauração
- ✅ Relatórios
- ✅ Interface responsiva (mobile-friendly)

### Limitações do plano gratuito:
- **Vercel**: 100GB bandwidth/mês
- **Netlify**: 100GB bandwidth/mês
- **Supabase**: 500MB storage, 2GB bandwidth/mês

## 🔒 Segurança em Produção

### Configurações recomendadas:

1. **RLS (Row Level Security)**
   ```sql
   -- Execute no Supabase SQL Editor
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
   
   -- Políticas mais restritivas para produção
   CREATE POLICY "Users can only see their own data" ON products
   FOR ALL USING (auth.uid() = user_id);
   ```

2. **Autenticação obrigatória**
   - Configure autenticação via email/senha
   - Ou integre com Google/GitHub OAuth

3. **Backup automático**
   - Configure backups automáticos no Supabase
   - Use o componente BackupManager para backups manuais

## 🚀 Deploy Rápido (1 clique)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/jeser-bebidas)

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs**
   - Vercel: Dashboard > Functions > View Function Logs
   - Netlify: Dashboard > Deploys > Deploy Log

2. **Variáveis de ambiente**
   - Certifique-se de que todas as variáveis estão configuradas
   - Use `VITE_` como prefixo para variáveis do frontend

3. **Build local**
   ```bash
   npm run build
   npm run preview
   ```

## 🎉 Próximos Passos

Após o deploy:

1. **Teste todas as funcionalidades**
2. **Configure domínio personalizado**
3. **Configure SSL (automático no Vercel/Netlify)**
4. **Monitore performance e uso**
5. **Configure analytics (opcional)**

---

**🌟 Sua aplicação Jeser Bebidas estará disponível 24/7 na web!**