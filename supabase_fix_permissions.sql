-- EXECUTAR NO SQL EDITOR DO SUPABASE PARA RESOLVER PROBLEMAS DE ACESSO
-- Esse script garante que qualquer usuário logado possa ler e criar seu próprio perfil

-- 1. Desabilitar RLS temporariamente para testes (OPCIONAL, COMENTE SE PREFERIR SEGURANÇA MÁXIMA)
-- ALTER TABLE public.user_rules DISABLE ROW LEVEL SECURITY;

-- 2. OU Criar políticas de RLS corretas:
ALTER TABLE public.user_rules ENABLE ROW LEVEL SECURITY;

-- Permitir que todos vejam seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.user_rules;
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.user_rules FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Permitir que usuários autenticados criem seu perfil inicial
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.user_rules;
CREATE POLICY "Usuários podem criar seu próprio perfil" 
ON public.user_rules FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Permitir que administradores vejam tudo
DROP POLICY IF EXISTS "Admins podem ver tudo" ON public.user_rules;
CREATE POLICY "Admins podem ver tudo" 
ON public.user_rules FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_rules 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Garantir acesso Admin total (Override de segurança para o dono do projeto)
GRANT ALL ON public.user_rules TO authenticated;
GRANT ALL ON public.user_rules TO service_role;
