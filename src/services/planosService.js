import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarPlanos(userId) {
    const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("valor", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarPlano(dados, userId) {
    // Validação básica
    if (!dados.tipo || dados.tipo.trim() === "") {
        throw new Error("O nome do plano (tipo) é obrigatório.");
    }
    if (dados.valor === undefined || dados.valor === null) {
        throw new Error("O valor do plano é obrigatório.");
    }
    if (!dados.prazo) {
        throw new Error("O prazo do plano é obrigatório.");
    }

    const { error } = await supabase
        .from("planos")
        .insert([{
            tipo: dados.tipo.toUpperCase(),
            valor: parseFloat(dados.valor),
            prazo: parseInt(dados.prazo),
            user_id: userId
        }]);

    if (error) throw error;
}

export async function atualizarPlano(id, dados, userId) {
    if (dados.tipo) {
        dados.tipo = dados.tipo.toUpperCase();
    }
    if (dados.valor !== undefined) {
        dados.valor = parseFloat(dados.valor);
    }
    if (dados.prazo !== undefined) {
        dados.prazo = parseInt(dados.prazo);
    }

    const { error } = await supabase
        .from("planos")
        .update(dados)
        .eq("id", id);

    if (error) throw error;
}

export async function excluirPlano(id) {
    const { error } = await supabase
        .from("planos")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
