-- 🚀 MIGRACAO: GESTAO DE FINALIZADORAS (finalizadoras) 🚀

-- 1. Criação da tabela de finalizadoras
CREATE TABLE IF NOT EXISTS public.finalizadoras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,      -- Nome da finalizadora (ex: 'Dinheiro', 'Cartão')
    integracao BOOLEAN DEFAULT FALSE, -- Se possui integração automática
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.finalizadoras ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
-- Especial: Permitir que o Admin (via e-mail) faça TUDO
DROP POLICY IF EXISTS "finalizadoras_admin_all" ON public.finalizadoras;
CREATE POLICY "finalizadoras_admin_all" ON public.finalizadoras
FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_finalizadoras_user_id ON public.finalizadoras(user_id);
