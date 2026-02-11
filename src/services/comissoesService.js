import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Lista comissões do usuário com joins para clientes e vendedores
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function listarComissoes(userId) {
    const { data, error } = await supabase
        .from("comissoes")
        .select(`
      *,
      clientes:cliente_id (
        id,
        prospect_id,
        valor_contrato,
        comissao,
        prospects:prospect_id (
          id,
          nome
        )
      ),
      vendedores:vendedor_id (
        id,
        nome
      )
    `)
        .eq("user_id", userId)
        .order("vencimento", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Cria uma nova comissão
 * @param {Object} payload 
 * @param {string} userId 
 */
export async function criarComissao(payload, userId) {
    const dataWithUser = {
        ...payload,
        user_id: userId
    };

    const { data, error } = await supabase
        .from("comissoes")
        .insert([dataWithUser])
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar comissão:", error);
        throw error;
    }
    return data;
}

/**
 * Atualiza uma comissão existente
 * @param {number} id 
 * @param {Object} payload 
 */
export async function atualizarComissao(id, payload) {
    const { data, error } = await supabase
        .from("comissoes")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Erro ao atualizar comissão:", error);
        throw error;
    }
    return data;
}

/**
 * Remove uma comissão
 * @param {number} id 
 */
export async function excluirComissao(id) {
    const { error } = await supabase
        .from("comissoes")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

/**
 * Verifica se já existe comissão para o cliente na mesma vigência
 * @param {number} clienteId 
 * @param {string} vigencia (MM/YYYY)
 * @param {number} [excludeId] 
 */
export async function verificarDuplicado(clienteId, vigencia, excludeId = null) {
    let query = supabase
        .from("comissoes")
        .select("id")
        .eq("cliente_id", clienteId)
        .eq("vigencia", vigencia);

    if (excludeId) {
        query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0;
}
