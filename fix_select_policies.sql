-- GARANTIR PERMISSÃO DE LEITURA EM TABELAS GLOBAIS
-- Execute este script no SQL Editor do Supabase se o erro 403 persistir

-- Segmentos
DROP POLICY IF EXISTS "Segmentos visíveis para todos autenticados" ON public.segmentos;
CREATE POLICY "Segmentos visíveis para todos autenticados" 
ON public.segmentos FOR SELECT 
TO authenticated 
USING (true);

-- Concorrentes
DROP POLICY IF EXISTS "Concorrentes visíveis para todos autenticados" ON public.concorrentes;
CREATE POLICY "Concorrentes visíveis para todos autenticados" 
ON public.concorrentes FOR SELECT 
TO authenticated 
USING (true);

-- Vendedores (Nota: esta tabela tem user_id, a política de SELECT deve considerar isso ou ser global baseada no seu uso)
-- Geralmente vendedores são isolados por usuário no seu schema.
DROP POLICY IF EXISTS "Usuários veem apenas seus vendedores" ON public.vendedores;
CREATE POLICY "Usuários veem apenas seus vendedores" 
ON public.vendedores FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
