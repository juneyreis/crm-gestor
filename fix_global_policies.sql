-- CORREÇÃO DE POLÍTICAS RLS PARA TABELAS GLOBAIS
-- Execute este script no SQL Editor do Supabase

-- 1. Políticas para SEGMENTOS
-- Permite que qualquer usuário autenticado insira novos segmentos
CREATE POLICY "Segmentos inseríveis por todos autenticados" 
ON public.segmentos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permite que qualquer usuário autenticado edite segmentos
CREATE POLICY "Segmentos editáveis por todos autenticados" 
ON public.segmentos FOR UPDATE 
TO authenticated 
USING (true);

-- Permite que qualquer usuário autenticado exclua segmentos
CREATE POLICY "Segmentos excluíveis por todos autenticados" 
ON public.segmentos FOR DELETE 
TO authenticated 
USING (true);


-- 2. Políticas para CONCORRENTES
-- Permite que qualquer usuário autenticado insira novos concorrentes
CREATE POLICY "Concorrentes inseríveis por todos autenticados" 
ON public.concorrentes FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permite que qualquer usuário autenticado edite concorrentes
CREATE POLICY "Concorrentes editáveis por todos autenticados" 
ON public.concorrentes FOR UPDATE 
TO authenticated 
USING (true);

-- Permite que qualquer usuário autenticado exclua concorrentes
CREATE POLICY "Concorrentes excluíveis por todos autenticados" 
ON public.concorrentes FOR DELETE 
TO authenticated 
USING (true);
