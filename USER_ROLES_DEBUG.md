# 🔧 Debug: user_roles Não Está Sendo Criado

## ✅ Melhorias Implementadas

Atualizei o **AuthContext.jsx** para:
1. **Fazer login ANTES de criar user_roles** (importante para ter sessão ativa)
2. **Logs detalhados** de erro (não apenas warning)
3. **Detalhes completos** do erro retornado

---

## 🚀 Como Testar Agora

### Passo 1: Abra o DevTools
- Pressione **F12** no navegador
- Vá para **Console**

### Passo 2: Crie Nova Conta
- Vá para `/cadastro`
- Preencha email e senha
- Clique em **Cadastro**

### Passo 3: Verifique os Logs

Se aparecer **✅ user_roles criado com sucesso** → Tudo OK! ✓

Se aparecer **❌ Erro ao criar user_roles** → Verifique o erro abaixo

---

## ❌ Se Receber Erro, Verifique:

### Erro: "row level security"
```
❌ Erro ao criar user_roles: {...code: "PGRST301"...}
```

**Solução:** RLS está bloqueando INSERT
- Vá para **user_roles** → **RLS** → Desabilite RLS temporariamente
- Crie uma conta nova (deve funcionar agora)
- Depois reabilite RLS com a policy correta

### Erro: "permission denied"
```
❌ Erro ao criar user_roles: {...message: "permission denied"...}
```

**Solução:** RLS policy está incorreta
- Verifique a policy de INSERT em user_roles
- Deve ser simples: `auth.role() = 'authenticated'` ou sem policy

### Erro: "unique violation"
```
❌ Erro ao criar user_roles: {...code: "23505"...}
```

**Solução:** Esse user_id já existe em user_roles
- Limpe a tabela user_roles (ou delete esse user_id específico)
- Crie nova conta

---

## 📋 Checklist Supabase

Verifique se tudo está configurado:

1. **Tabela user_roles existe?**
   - [ ] Vá para **Tables** → Procure **user_roles**
   - [ ] Deve ter colunas: id, user_id, role, email, created_at

2. **RLS está ativado em user_roles?**
   - [ ] Clique em **user_roles** → **RLS**
   - [ ] Deve estar **ATIVADO** (toggle azul)

3. **Policy de SELECT existe?**
   - [ ] Na seção RLS, deve ter 1 policy chamada algo como "select_user_roles"
   - [ ] Expression: `auth.role() = 'authenticated'`

4. **Coluna user_id em visitas existe?**
   - [ ] Vá para **Tables** → **visitas**
   - [ ] Procure coluna **user_id** (tipo UUID)

5. **RLS está ativado em visitas?**
   - [ ] Clique em **visitas** → **RLS**
   - [ ] Deve estar **ATIVADO** (toggle azul)
   - [ ] Deve ter 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## 🧪 Teste Rápido (Se Tudo Configurado)

1. **Abra DevTools** (F12) → Console
2. **Crie conta nova** em /cadastro
3. **Verifique logs**:
   - ✅ Deve ver: "user_roles criado com sucesso"
   - ❌ Se vir erro, copie a mensagem aqui

---

## 🔍 Verificar No Supabase Manualmente

Depois de criar conta:

1. Vá para **Authentication** → **Users**
   - [ ] Veja o novo usuário criado?

2. Vá para **user_roles** (em Tables)
   - [ ] Veja uma linha nova com seu email?
   - [ ] role = 'user'?

Se vir em ambos os lugares → **Tudo OK!** ✅

---

## 💡 Se Nada Funcionar

Tente desabilitar RLS temporariamente:

1. Vá para **user_roles** → **RLS**
2. Clique em **Disable RLS** (vermelho)
3. Crie nova conta
4. Verifique se user_roles foi criado

Se funcionou sem RLS:
- O problema é a policy de RLS
- Reabilite RLS
- Corrija a policy (deve ser: `auth.role() = 'authenticated'`)

Se **não funcionou nem sem RLS**:
- Verificar se a tabela user_roles realmente existe
- Verificar sintaxe do INSERT (deveria estar correto)
- Abrir DevTools → Console → copiar erro exato

---

## ✅ Quando Estiver Funcionando

- ✅ Console mostra: "user_roles criado com sucesso"
- ✅ Supabase → user_roles mostra nova linha
- ✅ Email está correto
- ✅ role é 'user'

**Parabéns! Agora pode testar o resto da app!** 🎉

