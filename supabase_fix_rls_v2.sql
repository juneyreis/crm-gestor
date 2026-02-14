-- 🛠️ CORREÇÃO DE ERRO 500 (RECURSIVIDADE RLS) 🛠️
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função helper que ignora RLS (SECURITY DEFINER)
-- Isso evita o loop infinito de "para ler a regra, preciso ler a regra"
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_rules
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualizar políticas da tabela user_rules
ALTER TABLE public.user_rules ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que causam loop
DROP POLICY IF EXISTS "admin_read_all" ON public.user_rules;
DROP POLICY IF EXISTS "self_read" ON public.user_rules;
DROP POLICY IF EXISTS "self_insert" ON public.user_rules;

-- NOVA POLÍTICA: Usuários podem ver seu próprio perfil
CREATE POLICY "allow_self_read" ON public.user_rules
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- NOVA POLÍTICA: Administradores podem ver TUDO (Usa a função helper para evitar loop)
CREATE POLICY "allow_admin_read_all" ON public.user_rules
FOR SELECT TO authenticated
USING (public.is_admin());

-- NOVA POLÍTICA: Auto-registro inicial (Permite que o syncProfile crie o registro 'pending')
CREATE POLICY "allow_self_insert" ON public.user_rules
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- NOVA POLÍTICA: Admin pode editar qualquer um
DROP POLICY IF EXISTS "admin_update_all" ON public.user_rules;
CREATE POLICY "admin_update_all" ON public.user_rules
FOR UPDATE TO authenticated
USING (public.is_admin());

-- Garantir que seu email principal seja admin agora para não perder o acesso
UPDATE public.user_rules 
SET role = 'admin', status = 'active'
WHERE email = 'juneyreis@gmail.com';
