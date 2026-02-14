import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Helper para converter objeto Date ou string para ISO preservando o tempo local
 * (Ignora o shift do timezone UTC ao salvar)
 */
export function toISOStringLocal(dateInput) {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    // Constrói string ISO baseada nos componentes LOCAIS do dispositivo
    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // Retorna no formato ISO mas sem o sufixo 'Z' ou offset, 
    // permitindo que o Postgres trate como local ou respeite a string enviada.
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * --- CONTATOS ---
 */

export async function listarContatos(userId, isAdmin = false) {
    let query = supabase
        .from("agenda_contatos")
        .select("*")
        .order("nome", { ascending: true });

    if (userId && !isAdmin) {
        query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function criarContato(payload, userId) {
    const { data, error } = await supabase
        .from("agenda_contatos")
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function atualizarContato(id, payload) {
    const { data, error } = await supabase
        .from("agenda_contatos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function excluirContato(id) {
    const { error } = await supabase
        .from("agenda_contatos")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

/**
 * --- EVENTOS ---
 */

export async function listarEventos(userId) {
    const { data, error } = await supabase
        .from("agenda_eventos")
        .select(`
            *,
            contato:contato_id (
                id,
                nome,
                empresa
            )
        `)
        .eq("user_id", userId)
        .order("data_inicio", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarEvento(payload, userId) {
    const { data, error } = await supabase
        .from("agenda_eventos")
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function atualizarEvento(id, payload) {
    const { data, error } = await supabase
        .from("agenda_eventos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function excluirEvento(id) {
    const { error } = await supabase
        .from("agenda_eventos")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

/**
 * Busca compromissos do dia atual para alertas
 */
export async function listarCompromissosHoje(userId) {
    const now = new Date();

    // Início do dia (00:00:00 local)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    // Fim do dia (23:59:59 local)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const { data, error } = await supabase
        .from("agenda_eventos")
        .select("*")
        .eq("user_id", userId)
        .gte("data_inicio", toISOStringLocal(startOfDay))
        .lte("data_inicio", toISOStringLocal(endOfDay))
        .order("data_inicio", { ascending: true });

    if (error) throw error;
    return data;
}
