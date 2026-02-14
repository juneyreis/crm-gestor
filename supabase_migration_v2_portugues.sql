-- 🚀 MIGRACAO: GESTAO FINANCEIRA (user_historico) 🚀

-- 1. Criação da nova tabela em Português
CREATE TABLE IF NOT EXISTS public.user_historico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_plano TEXT NOT NULL,
    valor_pago DECIMAL(10,2),
    metodo_pagamento TEXT, -- 'pix', 'cartao', 'transferencia', 'dinheiro'
    periodo_inicio DATE,
    periodo_fim DATE,
    observacoes TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migração de dados (se a tabela antiga existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions_history') THEN
        INSERT INTO public.user_historico (
            id, usuario_id, tipo_plano, valor_pago, data_pagamento, periodo_inicio, periodo_fim, metodo_pagamento, observacoes, created_at
        )
        SELECT 
            id, user_id, plan_type, amount_paid, payment_date, period_start, period_end, payment_method, notes, created_at
        FROM public.user_subscriptions_history;
        
        -- Opcional: Remover a tabela antiga após conferir os dados
        -- DROP TABLE public.user_subscriptions_history;
    END IF;
END $$;

-- 3. Habilitar RLS
ALTER TABLE public.user_historico ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança
-- Especial: Permitir que o Admin (via e-mail) faça TUDO
DROP POLICY IF EXISTS "historico_admin_all" ON public.user_historico;
CREATE POLICY "historico_admin_all" ON public.user_historico
FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'juneyreis@gmail.com'
);

-- Usuário vê apenas o SEU histórico
DROP POLICY IF EXISTS "historico_self_read" ON public.user_historico;
CREATE POLICY "historico_self_read" ON public.user_historico
FOR SELECT TO authenticated
USING (auth.uid() = usuario_id);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_user_historico_usuario_id ON public.user_historico(usuario_id);
