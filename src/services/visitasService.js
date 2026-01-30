import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarVisitas(userId) {
  // Se userId é fornecido, filtrar por usuário
  // Caso contrário, retornar todos (será filtrado pelo RLS no Supabase)
  let query = supabase
    .from("visitas")
    .select("*")
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
  
  if (error) throw error;
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
  
  if (error) throw error;
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
