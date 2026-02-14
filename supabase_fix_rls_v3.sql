-- 🛠️ REPARO DE EMERGÊNCIA: FIM DA RECURSIVIDADE RLS 🛠️
-- Execute este script no SQL Editor do Supabase para destravar o sistema

-- 1. Desabilitar RLS temporariamente para limpeza das políticas problemáticas
ALTER TABLE public.user_rules DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas que causam loop infinito (Recursion)
DROP POLICY IF EXISTS "admin_read_all" ON public.user_rules;
DROP POLICY IF EXISTS "self_read" ON public.user_rules;
DROP POLICY IF EXISTS "self_insert" ON public.user_rules;
DROP POLICY IF EXISTS "allow_self_read" ON public.user_rules;
DROP POLICY IF EXISTS "allow_admin_read_all" ON public.user_rules;
DROP POLICY IF EXISTS "allow_self_insert" ON public.user_rules;
DROP POLICY IF EXISTS "admin_update_all" ON public.user_rules;

-- 3. Criar a nova estrutura de políticas SEGURA e SEM LOOP
-- Usamos o e-mail do JWT para a regra de Admin, o que é offline e instantâneo
ALTER TABLE public.user_rules ENABLE ROW LEVEL SECURITY;

-- REGRA 1: Usuários podem ler o próprio perfil (Baseado no ID da sessão)
CREATE POLICY "user_read_self" ON public.user_rules
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- REGRA 2: Administradores podem ler TUDO (Baseado no e-mail fixo por segurança e performance)
CREATE POLICY "admin_read_global" ON public.user_rules
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- REGRA 3: Administradores podem editar TUDO
CREATE POLICY "admin_write_global" ON public.user_rules
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- REGRA 4: Permitir o auto-registro inicial
CREATE POLICY "user_insert_self" ON public.user_rules
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Garantir que o Admin principal esteja ativo no banco
INSERT INTO public.user_rules (user_id, email, role, status, plan_type)
SELECT id, email, 'admin', 'active', 'premium'
FROM auth.users
WHERE email = 'juneyreis@gmail.com'
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', status = 'active';

-- 5. Indexação (Para performance)
CREATE INDEX IF NOT EXISTS idx_user_rules_user_id ON public.user_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rules_role ON public.user_rules(role);
