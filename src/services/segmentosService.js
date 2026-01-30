import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarSegmentos(userId) {
    const { data, error } = await supabase
        .from("segmentos")
        .select("*")
        .eq("user_id", userId)
        .order("descricao", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarSegmento(descricao, userId) {
    // Validação: Descrição obrigatória e max 40 chars
    if (!descricao || descricao.trim() === "") {
        throw new Error("A descrição é obrigatória.");
    }
    if (descricao.length > 40) {
        throw new Error("A descrição deve ter no máximo 40 caracteres.");
    }

    // Verificar duplicidade para este usuário
    const { data: existing } = await supabase
        .from("segmentos")
        .select("id")
        .eq("user_id", userId)
        .ilike("descricao", descricao)
        .maybeSingle();

    if (existing) {
        throw new Error("Você já tem um segmento com esta descrição.");
    }

    const { error } = await supabase
        .from("segmentos")
        .insert([{
            descricao: descricao.toUpperCase(),
            plotar: true,
            user_id: userId
        }]);

    if (error) throw error;
}

export async function atualizarSegmento(id, dados, userId) {
    if (dados.descricao) {
        if (dados.descricao.length > 40) {
            throw new Error("A descrição deve ter no máximo 40 caracteres.");
        }

        // Verificar duplicidade (exceto o próprio) para este usuário
        const { data: existing } = await supabase
            .from("segmentos")
            .select("id")
            .eq("user_id", userId)
            .ilike("descricao", dados.descricao)
            .neq("id", id)
            .maybeSingle();

        if (existing) {
            throw new Error("Você já tem um segmento com esta descrição.");
        }

        dados.descricao = dados.descricao.toUpperCase();
    }

    const { error } = await supabase
        .from("segmentos")
        .update(dados)
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function excluirSegmento(id) {
    // Verificar se há prospects vinculados
    const { count, error: countError } = await supabase
        .from("prospects")
        .select("*", { count: 'exact', head: true })
        .eq("segmento_id", id);

    if (countError) throw countError;

    if (count > 0) {
        throw new Error(`Não é possível excluir: existem ${count} prospects vinculados a este segmento.`);
    }

    const { error } = await supabase
        .from("segmentos")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function togglePlotar(id, statusAtual, userId) {
    const { error } = await supabase
        .from("segmentos")
        .update({ plotar: !statusAtual })
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function marcarTodosParaPlotar(marcar, userId) {
    const { error } = await supabase
        .from("segmentos")
        .update({ plotar: marcar })
        .eq("user_id", userId);

    if (error) throw error;
}
