# Configuração do Supabase - Lista de Verificação

## Status: ⚠️ IMPORTANTE - Executar antes de usar a aplicação

O backend frontend foi completamente integrado com:
- ✅ Sistema de autenticação (signup, login, logout)
- ✅ Contexto de autenticação com auto-criação de user_roles
- ✅ Filtragem de dados por usuário
- ✅ Validação de propriedade (usuário só pode editar/deletar seus próprios registros)

**FALTA:** Executar os comandos SQL no Supabase dashboard para preparar o banco de dados.

---

## Passo 1: Criar Coluna user_id na Tabela visitas

No **Supabase Dashboard** → Seu projeto → **SQL Editor** → Execute:

```sql
ALTER TABLE visitas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para melhorar performance
CREATE INDEX idx_visitas_user_id ON visitas(user_id);
```

**⚠️ Nota:** Se você já tem dados existentes, execute este comando adicional para associar aos dados antigos:
```sql
-- OPCIONAL: Associar dados existentes a um usuário específico
UPDATE visitas SET user_id = 'PASTE_YOUR_USER_ID_HERE' WHERE user_id IS NULL;
```

---

## Passo 2: Criar Tabela user_roles

No **Supabase Dashboard** → **SQL Editor** → Execute:

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- Criar índice para performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

---

## Passo 3: Habilitar Row Level Security (RLS) na Tabela visitas

No **Supabase Dashboard** → Tabela **visitas** → **RLS** → Ativar RLS

Depois clique em "New Policy" e execute cada política abaixo:

### Política 1: SELECT (Usuário vê seus registros + admin vê todos)
```sql
SELECT
  auth.uid() = visitas.user_id
  OR (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
```

### Política 2: INSERT (Usuário pode inserir apenas seus registros)
```sql
auth.uid() = visitas.user_id
```

### Política 3: UPDATE (Usuário atualiza seu ou admin atualiza qualquer um)
```sql
auth.uid() = visitas.user_id
OR (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
```

### Política 4: DELETE (Usuário deleta seu ou admin deleta qualquer um)
```sql
auth.uid() = visitas.user_id
OR (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
```

---

## Passo 4: Habilitar RLS na Tabela user_roles

No **Supabase Dashboard** → Tabela **user_roles** → **RLS** → Ativar RLS

### Política: SELECT (Qualquer usuário autenticado pode ler)
```sql
auth.role() = 'authenticated'
```

---

## Passo 5: Criar Usuário Admin (Opcional)

Se quer que **juneyreis@gmail.com** seja admin e veja todos os registros:

1. Vá para **Authentication** → **Users** → Crie user: `juneyreis@gmail.com`
2. Copie o UUID do usuário
3. Execute no SQL Editor:

```sql
INSERT INTO user_roles (user_id, role, email) 
VALUES ('PASTE_USER_UUID_HERE', 'admin', 'juneyreis@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

---

## Verificação Final

Depois de executar tudo, teste:

1. **Signup:** Crie nova conta em `/cadastro`
   - Verifique que `user_roles` foi criado automaticamente com role='user'
   - Verifique que seu email está correto

2. **Login:** Faça login com a conta criada

3. **Crie uma Visita:** Adicione uma visita em `/visitas`
   - Verifique que está associada ao seu `user_id`

4. **Filtragem:** Certifique que não vê visitas de outros usuários

5. **Admin Test** (se criou admin):
   - Login com admin
   - Deve ver todas as visitas

---

## Troubleshooting

### ❌ Erro: "row level security is not enabled"
- Vá para RLS da tabela e marque "Enable RLS"

### ❌ Erro: "null value in column user_id"
- Certifique-se de que está logado quando cria visita
- Verifique que o user_id está sendo passado corretamente

### ❌ Não consegue deletar/editar visita
- Verifique que a visita pertence a você (user_id = seu UUID)
- Verifique que as policies de UPDATE/DELETE estão corretas

### ❌ Admin não vê todas as visitas
- Verifique que admin está na tabela `user_roles` com role='admin'
- Verifique que as RLS policies usam `(SELECT role FROM user_roles...)` corretamente

---

## ✅ Pronto!

Depois de completar todos os passos, a aplicação estará totalmente funcional com:
- Autenticação segura
- Isolamento de dados por usuário
- Suporte a admin
- Row Level Security garantindo segurança no banco de dados
