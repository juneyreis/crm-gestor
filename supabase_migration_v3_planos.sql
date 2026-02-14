-- 🚀 MIGRACAO: GESTAO DE PLANOS (planos) 🚀

-- 1. Criação da tabela de planos
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,           -- Nome do plano (ex: 'Básico', 'Premium')
    valor DECIMAL(10,2) NOT NULL, -- Valor do plano
    prazo INTEGER NOT NULL,      -- Quantidade de dias para uso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
-- Especial: Permitir que o Admin (via e-mail) faça TUDO
DROP POLICY IF EXISTS "planos_admin_all" ON public.planos;
CREATE POLICY "planos_admin_all" ON public.planos
FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- Usuários comuns podem apenas VER os planos (se necessário no futuro)
-- Por enquanto, seguindo a restrição de acesso somente pelo usuário admin solicitada
-- DROP POLICY IF EXISTS "planos_read_all" ON public.planos;
-- CREATE POLICY "planos_read_all" ON public.planos
-- FOR SELECT TO authenticated
-- USING (true);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_planos_user_id ON public.planos(user_id);
