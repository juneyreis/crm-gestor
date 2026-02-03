import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarVisitas(userId) {
  // Buscar visitas com JOIN de prospects e concorrentes
  let query = supabase
    .from("visitas")
    .select(`
      *,
      prospects:prospect_id (
        id,
        nome,
        endereco,
        cidade,
        bairro,
        contato,
        telefone,
        celular,
        concorrente_id
      ),
      concorrentes:concorrente_id (
        id,
        descricao
      )
    `)
    .order("data", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function criarVisita(payload, userId) {
  // Adicionar user_id automaticamente
  const dataWithUser = {
    ...payload,
    user_id: userId
  };

  const { error } = await supabase
    .from("visitas")
    .insert([dataWithUser]);

  if (error) {
    console.error("Erro Criar Visita:", error);
    alert(`Erro ao criar visita: ${error.message}\nDetalhes: ${error.details || ''}\nCódigo: ${error.code}`);
    throw error;
  }
}

export async function atualizarVisita(id, payload, userId) {
  // Validar se o usuário é dono do registro
  const { data: visita, error: fetchError } = await supabase
    .from("visitas")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (visita?.user_id !== userId) {
    throw new Error("Você não tem permissão para editar este registro");
  }

  const { error } = await supabase
    .from("visitas")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Erro Atualizar Visita:", error);
    alert(`Erro ao atualizar visita: ${error.message}\nDetalhes: ${error.details || ''}\nCódigo: ${error.code}`);
    throw error;
  }
}

export async function excluirVisita(id, userId) {
  // Validar se o usuário é dono do registro
  const { data: visita, error: fetchError } = await supabase
    .from("visitas")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (visita?.user_id !== userId) {
    throw new Error("Você não tem permissão para deletar este registro");
  }

  const { error } = await supabase
    .from("visitas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function importarVisitasEmLote(visitasData, userId) {
  // Adicionar user_id a cada visita
  const visitasComUser = visitasData.map(visita => ({
    ...visita,
    user_id: userId
  }));

  // Inserir em lote
  const { error } = await supabase
    .from("visitas")
    .insert(visitasComUser);

  if (error) throw error;
}

// ⭐ NOVAS FUNÇÕES PARA INTEGRAÇÃO COM PROSPECTS

/**
 * Buscar lista de prospects do usuário para combobox
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de prospects
 */
export async function buscarProspects(userId) {
  const { data, error } = await supabase
    .from("prospects")
    .select("id, nome, endereco, cidade, bairro, contato, telefone, celular, concorrente_id")
    .eq("user_id", userId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Buscar dados completos de um prospect por ID para auto-fill
 * @param {number} prospectId - ID do prospect
 * @returns {Promise<Object>} Dados do prospect
 */
export async function buscarProspectPorId(prospectId) {
  const { data, error } = await supabase
    .from("prospects")
    .select(`
      id,
      nome,
      endereco,
      cidade,
      bairro,
      contato,
      telefone,
      celular,
      concorrente_id,
      concorrentes:concorrente_id (
        id,
        descricao
      )
    `)
    .eq("id", prospectId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Buscar lista de concorrentes para combobox
 * @returns {Promise<Array>} Lista de concorrentes
 */
export async function buscarConcorrentes() {
  const { data, error } = await supabase
    .from("concorrentes")
    .select("id, descricao")
    .order("descricao", { ascending: true });

  if (error) throw error;
  return data || [];
}
