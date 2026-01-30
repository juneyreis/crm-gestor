-- MIGRAÇÃO: ISOLAMENTO POR USUÁRIO EM SEGMENTOS E CONCORRENTES
-- Execute este script no SQL Editor do Supabase

-- 1. ADICIONAR COLUNA USER_ID
ALTER TABLE public.segmentos ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.concorrentes ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. LIMPAR OU ATUALIZAR DADOS EXISTENTES (OPCIONAL)
-- Se você quiser que os dados atuais pertençam ao seu usuário atual:
-- UPDATE public.segmentos SET user_id = 'ID-DO-SEU-USUARIO-AQUI' WHERE user_id IS NULL;
-- UPDATE public.concorrentes SET user_id = 'ID-DO-SEU-USUARIO-AQUI' WHERE user_id IS NULL;

-- 3. REMOVER POLÍTICAS ANTIGAS (GLOBAIS)
DROP POLICY IF EXISTS "Segmentos visíveis para todos autenticados" ON public.segmentos;
DROP POLICY IF EXISTS "Segmentos inseríveis por todos autenticados" ON public.segmentos;
DROP POLICY IF EXISTS "Segmentos editáveis por todos autenticados" ON public.segmentos;
DROP POLICY IF EXISTS "Segmentos excluíveis por todos autenticados" ON public.segmentos;

DROP POLICY IF EXISTS "Concorrentes visíveis para todos autenticados" ON public.concorrentes;
DROP POLICY IF EXISTS "Concorrentes inseríveis por todos autenticados" ON public.concorrentes;
DROP POLICY IF EXISTS "Concorrentes editáveis por todos autenticados" ON public.concorrentes;
DROP POLICY IF EXISTS "Concorrentes excluíveis por todos autenticados" ON public.concorrentes;

-- 4. CRIAR NOVAS POLÍTICAS (ISOLAMENTO POR USER_ID)

-- SEGMENTOS
CREATE POLICY "Segmentos: Usuários veem apenas os seus" 
ON public.segmentos FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Segmentos: Usuários inserem apenas os seus" 
ON public.segmentos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Segmentos: Usuários editam apenas os seus" 
ON public.segmentos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Segmentos: Usuários excluem apenas os seus" 
ON public.segmentos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);


-- CONCORRENTES
CREATE POLICY "Concorrentes: Usuários veem apenas os seus" 
ON public.concorrentes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Concorrentes: Usuários inserem apenas os seus" 
ON public.concorrentes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Concorrentes: Usuários editam apenas os seus" 
ON public.concorrentes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Concorrentes: Usuários excluem apenas os seus" 
ON public.concorrentes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
