import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarFinalizadoras() {
    const { data, error } = await supabase
        .from("finalizadoras")
        .select("*")
        .order("descricao", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarFinalizadora(dados, userId) {
    if (!dados.descricao || dados.descricao.trim() === "") {
        throw new Error("A descrição da finalizadora é obrigatória.");
    }

    const { error } = await supabase
        .from("finalizadoras")
        .insert([{
            descricao: dados.descricao.toUpperCase(),
            integracao: !!dados.integracao,
            user_id: userId
        }]);

    if (error) throw error;
}

export async function atualizarFinalizadora(id, dados) {
    if (dados.descricao) {
        dados.descricao = dados.descricao.toUpperCase();
    }

    const { error } = await supabase
        .from("finalizadoras")
        .update(dados)
        .eq("id", id);

    if (error) throw error;
}

export async function excluirFinalizadora(id) {
    const { error } = await supabase
        .from("finalizadoras")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
