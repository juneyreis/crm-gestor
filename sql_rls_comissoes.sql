-- CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY) PARA COMISSÕES
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem (para evitar erros de duplicidade)
DROP POLICY IF EXISTS "Comissões: Usuários veem apenas as suas" ON public.comissoes;
DROP POLICY IF EXISTS "Comissões: Usuários inserem apenas as suas" ON public.comissoes;
DROP POLICY IF EXISTS "Comissões: Usuários editam apenas as suas" ON public.comissoes;
DROP POLICY IF EXISTS "Comissões: Usuários excluem apenas as suas" ON public.comissoes;

-- 3. Criar novas políticas (Isolamento por user_id)

-- SELECT: Usuários veem apenas seus próprios registros
CREATE POLICY "Comissões: Usuários veem apenas as suas" 
ON public.comissoes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas registros associados ao seu próprio user_id
CREATE POLICY "Comissões: Usuários inserem apenas as suas" 
ON public.comissoes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem editar apenas seus próprios registros
CREATE POLICY "Comissões: Usuários editam apenas as suas" 
ON public.comissoes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem excluir apenas seus próprios registros
CREATE POLICY "Comissões: Usuários excluem apenas as suas" 
ON public.comissoes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
