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
export async function atualizarStatusUsuario(userId, status) {
    const { data, error } = await supabase
        .from("user_rules")
        .update({ status })
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Atualiza a licença e o pano de um usuário
 */
export async function atualizarLicencaUsuario(userId, payload) {
    // payload: { plan_type, license_expires_at, role }
    const { data, error } = await supabase
        .from("user_rules")
        .update(payload)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
