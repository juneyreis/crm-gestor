-- Script de Atualização: Administração e Licenciamento
-- Execute este script no SQL Editor do seu Supabase Dashboard

-- 1. Adicionar colunas se não existirem
ALTER TABLE public.user_rules 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending')),
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Garantir que o cargo (role) tenha valores válidos
ALTER TABLE public.user_rules 
DROP CONSTRAINT IF EXISTS user_rules_role_check,
ADD CONSTRAINT user_rules_role_check CHECK (role IN ('admin', 'user'));

-- 3. Comentários para documentação
COMMENT ON COLUMN public.user_rules.status IS 'Status da conta: active (acesso total), blocked (bloqueado), pending (aguardando ativação)';
COMMENT ON COLUMN public.user_rules.plan_type IS 'Nível de licenciamento do usuário';
COMMENT ON COLUMN public.user_rules.license_expires_at IS 'Data e hora da expiração da licença do sistema';

-- 4. Criar índice para performance em buscas administrativas (opcional)
CREATE INDEX IF NOT EXISTS idx_user_rules_role ON public.user_rules(role);
CREATE INDEX IF NOT EXISTS idx_user_rules_status ON public.user_rules(status);

-- NOTA IMPORTANTE:
-- Para se tornar ADMIN, execute o comando abaixo substituindo o EMAIL:
-- UPDATE public.user_rules SET role = 'admin' WHERE email = 'seu_email@dominio.com';
