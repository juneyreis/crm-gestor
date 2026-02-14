-- 🚀 SCRIPT DE EVOLUÇÃO: LICENCIAMENTO SENIOR (CAMADA 2) 🚀

-- 1. Evolução da tabela user_rules (Camada 1: Acesso)
ALTER TABLE public.user_rules 
ADD COLUMN IF NOT EXISTS grace_period_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- 2. Criação da Tabela de Histórico (Camada 2: Gestão Financeira)
CREATE TABLE IF NOT EXISTS public.user_subscriptions_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    amount_paid DECIMAL(10,2),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start DATE,
    period_end DATE,
    payment_method TEXT, -- 'pix', 'cartao', 'manual'
    receipt_url TEXT,    -- Link para o comprovante
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS para a nova tabela
ALTER TABLE public.user_subscriptions_history ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança para o Histórico
-- Usuário vê apenas o SEU histórico
DROP POLICY IF EXISTS "history_self_read" ON public.user_subscriptions_history;
CREATE POLICY "history_self_read" ON public.user_subscriptions_history
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admin vê TUDO (Especialmente para você via e-mail)
DROP POLICY IF EXISTS "history_admin_read_all" ON public.user_subscriptions_history;
CREATE POLICY "history_admin_read_all" ON public.user_subscriptions_history
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_sub_history_user_id ON public.user_subscriptions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rules_expires ON public.user_rules(license_expires_at);
