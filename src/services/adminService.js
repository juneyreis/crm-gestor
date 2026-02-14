import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Lista todos os usuários e suas regras/perfis
 */
export async function listarUsuarios() {
    const { data, error } = await supabase
        .from("user_rules")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Atualiza o status de um usuário (active, blocked, pending)
 */
export async function atualizarStatusUsuario(usuarioId, status) {
    const { data, error } = await supabase
        .from("user_rules")
        .update({ status })
        .eq("user_id", usuarioId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Atualiza a licença e o plano de um usuário
 */
export async function atualizarLicencaUsuario(usuarioId, dados) {
    // dados: { plan_type, license_expires_at, role, grace_period_expires_at, subscription_status }
    // Nota: Mantemos os nomes dos campos da tabela user_rules como estão, pois o usuário não pediu para renomear essa tabela agora, 
    // apenas a de histórico e os arquivos/parâmetros.
    const { data, error } = await supabase
        .from("user_rules")
        .update(dados)
        .eq("user_id", usuarioId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Registra uma nova renovação/pagamento no histórico
 * payload: { usuario_id, tipo_plano, valor_pago, metodo_pagamento, periodo_inicio, periodo_fim, observacoes }
 */
export async function registrarPagamento(dados) {
    const payload = {
        usuario_id: dados.usuario_id,
        tipo_plano: dados.tipo_plano,
        valor_pago: dados.valor_pago,
        metodo_pagamento: dados.metodo_pagamento,
        periodo_inicio: dados.periodo_inicio,
        periodo_fim: dados.periodo_fim,
        observacoes: dados.observacoes
    };

    const { data, error } = await supabase
        .from("user_historico")
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Lista o histórico de assinaturas de um usuário
 */
export async function listarHistoricoAssinaturas(usuarioId) {
    const { data, error } = await supabase
        .from("user_historico")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("data_pagamento", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Exclui um registro do histórico
 */
export async function excluirPagamento(id) {
    const { error } = await supabase
        .from("user_historico")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}

/**
 * Atualiza um registro do histórico
 */
export async function editarPagamento(id, dados) {
    const { data, error } = await supabase
        .from("user_historico")
        .update(dados)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
