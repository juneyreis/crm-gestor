import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarClientes(userId) {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: true });

    if (error) throw error;
    return data;
}

export async function contarClientes(userId) {
    const { count, error } = await supabase
        .from("clientes")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

    if (error) throw error;
    return count;
}
