import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Lista clientes do usuário
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function listar(userId) {
    let query = supabase
        .from("clientes")
        .select(`
      *,
      prospects:prospect_id (nome),
      segmentos:segmento_id (descricao),
      vendedores:vendedor_id (nome)
    `)
        .eq("user_id", userId)
        .order("data_inicio_contrato", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Cria um novo cliente
 * @param {Object} cliente
 * @param {string} userId
 */
export async function criar(cliente, userId) {
    // Remover campos expandidos (joins) antes de salvar
    const { prospects, segmentos, vendedores, ...dadosParaSalvar } = cliente;

    const payload = { ...dadosParaSalvar, user_id: userId };
    const { data, error } = await supabase
        .from("clientes")
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar cliente:", error);
        throw error;
    }
    return data;
}

/**
 * Atualiza um cliente
 * @param {number} id
 * @param {Object} cliente
 */
export async function atualizar(id, cliente) {
    // Remover campos expandidos (joins) antes de atualizar
    const { prospects, segmentos, vendedores, ...dadosParaSalvar } = cliente;

    const { data, error } = await supabase
        .from("clientes")
        .update(dadosParaSalvar)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Erro ao atualizar cliente:", error);
        throw error;
    }
    return data;
}

/**
 * Remove um cliente
 * @param {number} id
 */
export async function remover(id) {
    const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao remover cliente:", error);
        throw error;
    }
}
