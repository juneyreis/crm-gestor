# 🚀 Guia Rápido - Como Testar a Aplicação

## ⏱️ Tempo Estimado: 10-15 minutos

---

## ✅ Pré-requisitos

- [ ] Node.js instalado
- [ ] Projeto React aberto em VS Code
- [ ] Conta Supabase criada (https://supabase.com)
- [ ] Variáveis de ambiente (.env.local) configuradas

---

## 📋 Passo 1: Configurar Supabase (5 minutos)

### 1.1 - Abra o arquivo SUPABASE_SETUP.md neste projeto

```
Na raiz do projeto: SUPABASE_SETUP.md
```

### 1.2 - Execute cada seção SQL no Supabase Dashboard

1. Vá para seu projeto em **supabase.com**
2. Clique em **SQL Editor** (lateral esquerda)
3. Clique em **New Query**
4. Copie e execute cada SQL do SUPABASE_SETUP.md:

```
✓ Passo 1: ALTER TABLE visitas ADD COLUMN user_id...
✓ Passo 2: CREATE TABLE user_roles...
✓ Passo 3: Habilitar RLS em visitas
✓ Passo 4: Habilitar RLS em user_roles
```

**Dica:** Execute um por um e espere a confirmação ✅

---

## 🏃 Passo 2: Iniciar a Aplicação (2 minutos)

No terminal do VS Code:

```bash
# Terminal 1: Instalar dependências (só na primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Saída esperada:
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

Acesse em **http://localhost:5173**

---

## 👤 Passo 3: Criar Conta (2 minutos)

1. Clique em **"Não possui conta? Cadastre-se"** ou vá para `/cadastro`

2. Preencha:
   - **Email:** seu-email@example.com
   - **Senha:** senha123456
   - **Confirmação:** senha123456

3. Clique em **"Cadastro"**

**Resultado esperado:**
- ✅ Redireciona para Dashboard
- ✅ Aparece mensagem de sucesso (se implementado)
- ✅ Menu mostra seu email no topo

**No Supabase:**
- ✅ Novo usuário criado em `Authentication > Users`
- ✅ Nova linha em `user_roles` com role='user'

---

## 📊 Passo 4: Criar Primeira Visita (3 minutos)

1. Clique em **"Visitas"** na sidebar

2. Clique em **"Nova Visita"** ou **"+"**

3. Preencha:
   - **Data:** Hoje
   - **Prospect:** Empresa Teste
   - **Endereço:** Rua Test, 123
   - **Cidade:** Porto Alegre
   - **Contato:** João Silva
   - **Telefone:** 51 99999-9999
   - **Sistema:** INDEFINIDO
   - **Regime:** REGULAR

4. Clique em **"Salvar"**

**Resultado esperado:**
- ✅ Visita aparece na tabela
- ✅ Visita está associada ao seu usuário

**No Supabase:**
- ✅ Nova linha em `visitas` com seu `user_id` preenchido

---

## 🔍 Passo 5: Testar Filtragem de Dados (3 minutos)

### 5.1 - Criar Segundo Usuário

1. **Logout:** Clique no seu email/avatar → **"Sair"**
2. Clique em **"Não possui conta? Cadastre-se"**
3. Preencha com outro email:
   - **Email:** outro@example.com
   - **Senha:** senha123456

### 5.2 - Testar Isolamento de Dados

- [ ] Segundo usuário **NÃO vê** a visita do primeiro
- [ ] Dashboard mostra 0 visitas (Visitas Mês, Hoje, etc.)
- [ ] Criar nova visita como segundo usuário
- [ ] Primeira conta vê apenas sua visita

**No Supabase:**
- [ ] Duas linhas diferentes em `visitas`
- [ ] Cada uma com seu `user_id` único

---

## 👑 Passo 6: Testar Admin (Opcional, 3 minutos)

Se quiser testar acesso admin:

1. **No Supabase Dashboard:**
   - Vá para `user_roles`
   - Encontre seu primeiro usuário
   - Mude `role` de 'user' para 'admin'

2. **Na App:**
   - Logout do segundo usuário
   - Login com primeira conta
   - Agora **deve ver todas as visitas** (suas + do outro usuário)

---

## 🎯 Checklist Final

- [ ] Supabase SQL executado (Passo 1)
- [ ] App rodando em http://localhost:5173 (Passo 2)
- [ ] Primeira conta criada (Passo 3)
- [ ] Visita criada com sucesso (Passo 4)
- [ ] Segunda conta criada (Passo 5)
- [ ] Dados isolados por usuário (Passo 5)
- [ ] Admin vê todas visitas (Passo 6 - opcional)

---

## ❌ Troubleshooting Rápido

### App não carrega em localhost:5173

```bash
# Verifique se servidor está rodando
# Terminal: npm run dev

# Se porta 5173 estiver ocupada
npm run dev -- --port 3000
```

### Erro "Supabase credentials not found"

```
Verifique .env.local:
- VITE_SUPABASE_URL=https://seu-projeto.supabase.co
- VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### Cadastro falha ou não cria user_roles

1. Verifique que `user_roles` table foi criada
2. Verifique RLS está habilitado em `user_roles`
3. Abra F12 (DevTools) → Console → Procure por erros

### Visitas não aparecem após criar

1. Atualize a página (F5)
2. Abra F12 → Console → Procure erros de RLS
3. Verifique no Supabase que coluna `user_id` existe

### Não consegue deletar visita

1. Verifique que a visita pertence a você (`user_id` === seu UUID)
2. Verifique que RLS delete policy está correta

---

## 📞 Dicas de Desenvolvimento

### Ver SQL Queries no Console

No DevTools (F12):
```javascript
// Habilita log de SQL queries
supabaseClient.realtime.setAuth('seu-token');
```

### Testar RLS Policies

Supabase Dashboard → Visitas → Authentication → RLS Debug

### Debug de Erros

1. Abra F12 (DevTools)
2. Aba **Console** mostra erros JavaScript
3. Aba **Network** mostra requisições Supabase
4. Aba **Storage** mostra tokens salvos

---

## ✨ Funcionalidades para Testar Depois

- [ ] Editar visita existente
- [ ] Deletar visita com confirmação
- [ ] Filtros avançados em Visitas
- [ ] Gráficos em Estatísticas
- [ ] Theme dark/light toggle
- [ ] Sidebar responsivo em mobile

---

## 🎉 Pronto!

Se chegou até aqui, sua aplicação está **100% funcional** com:
- ✅ Autenticação segura
- ✅ Isolamento de dados por usuário
- ✅ RLS no banco de dados
- ✅ Suporte a admin

**Próximos passos opcionais:**
1. Customizar temas
2. Adicionar mais campos em visitas
3. Implementar relatórios PDF
4. Deploy em produção

