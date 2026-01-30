# Deploy na Vercel - Guia Completo

Este guia explica como fazer deploy do projeto na Vercel mantendo compatibilidade com GitHub Pages e execução local.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório no GitHub com o código do projeto
- Variáveis de ambiente do Supabase

## 🚀 Configuração Inicial na Vercel

### 1. Importar Projeto

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório `visitas-react`
5. Clique em **"Import"**

### 2. Configurar Build Settings

A Vercel detectará automaticamente que é um projeto Vite. As configurações padrão devem ser:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

> [!IMPORTANT]
> Não altere essas configurações, elas estão corretas!

### 3. Adicionar Variáveis de Ambiente

Antes de fazer o deploy, configure as variáveis de ambiente:

1. Na página de configuração do projeto, vá para **"Environment Variables"**
2. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://hujtofmlumdleprkeiuw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anon do Supabase |

3. Certifique-se de que as variáveis estão disponíveis para **Production**, **Preview** e **Development**

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (leva ~2-3 minutos)
3. Após o deploy, você receberá uma URL como: `https://seu-projeto.vercel.app`

## 🔄 Deploys Automáticos

A Vercel está configurada para fazer deploy automático:

- **Push na branch `main`**: Deploy em produção
- **Pull Requests**: Deploy de preview para testar mudanças
- **Outras branches**: Deploy de preview

## 🏠 Execução Local

Para rodar localmente, continue usando:

```bash
npm run dev
```

O projeto usará automaticamente `base: '/'` em desenvolvimento.

## 🔧 Configuração de Múltiplos Ambientes

### Deploy na Vercel (padrão)

```bash
npm run build
```

Usa `base: '/'` automaticamente.

### Deploy no GitHub Pages

Para fazer deploy no GitHub Pages, você precisa definir a variável de ambiente:

```bash
# No workflow do GitHub Actions (.github/workflows/deploy.yml)
env:
  VITE_DEPLOY_TARGET: github
```

Isso já está configurado no seu workflow atual, então o GitHub Pages continuará funcionando normalmente.

## 📁 Arquivos de Configuração

### vercel.json

Configura o roteamento SPA para que todas as rotas redirecionem para `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### vite.config.js

Detecta o ambiente de deploy através da variável `VITE_DEPLOY_TARGET`:

- **Vercel/Local**: `base: '/'`
- **GitHub Pages**: `base: '/visitasweb/'`

## 🔍 Verificação

Após o deploy, teste as seguintes funcionalidades:

- [ ] Login funciona corretamente
- [ ] Navegação entre páginas funciona
- [ ] Dados do Supabase são carregados
- [ ] Refresh da página mantém a rota correta

## 🆘 Troubleshooting

### Erro 404 ao navegar

Se você receber erro 404 ao navegar para rotas específicas, verifique se o arquivo `vercel.json` está presente na raiz do projeto.

### Variáveis de ambiente não funcionam

1. Verifique se as variáveis começam com `VITE_`
2. Confirme que foram adicionadas no painel da Vercel
3. Faça um novo deploy após adicionar as variáveis

### Build falha

Verifique os logs de build na Vercel para identificar o erro. Geralmente é:
- Dependências faltando
- Erros de lint
- Variáveis de ambiente não configuradas

## 📊 Comparação: Vercel vs GitHub Pages

| Recurso | Vercel | GitHub Pages |
|---------|--------|--------------|
| **URL** | `seu-projeto.vercel.app` | `usuario.github.io/visitasweb` |
| **Deploy** | Automático (push) | Automático (push) |
| **Preview** | ✅ Para cada PR | ❌ Não |
| **Analytics** | ✅ Incluído | ❌ Não |
| **Custom Domain** | ✅ Grátis | ✅ Grátis |
| **Base Path** | `/` | `/visitasweb/` |

## 🎯 Próximos Passos

1. **Custom Domain** (opcional): Configure um domínio personalizado na Vercel
2. **Analytics**: Ative o Vercel Analytics para monitorar performance
3. **Preview Deployments**: Use para testar mudanças antes de mergear PRs

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI](https://vercel.com/docs/cli) - Para deploy via terminal
