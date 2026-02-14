-- 🚨 SCRIPT DE RECUPERAÇÃO NUCLEAR (RODAR NO SQL EDITOR DO SUPABASE) 🚨

-- 1. Primeiro, vamos garantir que a tabela user_rules aceite o seu registro
-- Se houver lixo ou registros antigos, esse script limpa e recria corretamente.

DO $$ 
DECLARE
    target_user_id UUID;
    target_email TEXT := 'juneyreis@gmail.com'; -- <--- SEU EMAIL AQUI
BEGIN
    -- Busca o ID do usuário na tabela de autenticação do Supabase
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- Se o usuário existe no Auth, vamos garantir que ele tenha as "Rules" de Admin
        RAISE NOTICE 'Usuário encontrado no Auth. Configurando permissões...';
        
        -- Remove registro antigo se houver conflito
        DELETE FROM public.user_rules WHERE email = target_email OR user_id = target_user_id;
        
        -- Insere o registro como ADMIN total
        INSERT INTO public.user_rules (user_id, email, role, status, plan_type)
        VALUES (target_user_id, target_email, 'admin', 'active', 'premium');
        
        RAISE NOTICE '✅ SUCESSO: Usuário % promovido a ADMIN.', target_email;
    ELSE
        -- Se o usuário NÃO existe no Auth, ele precisa ser criado pela interface de Auth do Supabase primeiro
        RAISE EXCEPTION '❌ ERRO: O email % não foi encontrado na aba Authentication do Supabase. Crie o usuário lá primeiro (botão Add User) e depois rode este script.', target_email;
    END IF;
END $$;

-- 2. Garantir que as políticas de segurança (RLS) não te bloqueiem durante o login
ALTER TABLE public.user_rules DISABLE ROW LEVEL SECURITY;
-- (Opcional) Se quiser manter RLS ativo, rode o script supabase_fix_permissions.sql carregado anteriormente.
