import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarConcorrentes(userId) {
    const { data, error } = await supabase
        .from("concorrentes")
        .select("*")
        .eq("user_id", userId)
        .order("descricao", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarConcorrente(dados, userId) {
    // Validação
    if (!dados.descricao || dados.descricao.trim() === "") {
        throw new Error("A descrição é obrigatória.");
    }
    if (dados.descricao.length > 40) {
        throw new Error("A descrição deve ter no máximo 40 caracteres.");
    }

    // Verificar duplicidade para este usuário
    const { data: existing } = await supabase
        .from("concorrentes")
        .select("id")
        .eq("user_id", userId)
        .ilike("descricao", dados.descricao)
        .maybeSingle();

    if (existing) {
        throw new Error("Você já tem um concorrente com esta descrição.");
    }

    const payload = {
        descricao: dados.descricao.toUpperCase(),
        observacoes: dados.observacoes ? dados.observacoes.toUpperCase() : null,
        plotar: dados.plotar,
        user_id: userId
    };

    const { error } = await supabase
        .from("concorrentes")
        .insert([payload]);

    if (error) throw error;
}

export async function atualizarConcorrente(id, dados, userId) {
    const payload = {};

    if (dados.descricao !== undefined) {
        if (!dados.descricao || dados.descricao.trim() === "") {
            throw new Error("A descrição é obrigatória.");
        }
        if (dados.descricao.length > 40) {
            throw new Error("A descrição deve ter no máximo 40 caracteres.");
        }

        // Verificar duplicidade (exceto o próprio) para este usuário
        const { data: existing } = await supabase
            .from("concorrentes")
            .select("id")
            .eq("user_id", userId)
            .ilike("descricao", dados.descricao)
            .neq("id", id)
            .maybeSingle();

        if (existing) {
            throw new Error("Você já tem um concorrente com esta descrição.");
        }

        payload.descricao = dados.descricao.toUpperCase();
    }

    if (dados.observacoes !== undefined) {
        payload.observacoes = dados.observacoes ? dados.observacoes.toUpperCase() : null;
    }

    if (dados.plotar !== undefined) {
        payload.plotar = dados.plotar;
    }

    const { error } = await supabase
        .from("concorrentes")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function excluirConcorrente(id) {
    // Verificar se há prospects vinculados
    // Nota: O campo na tabela prospects deve ser 'concorrente_id' conforme o schema solicitado anteriormente.
    const { count, error: countError } = await supabase
        .from("prospects")
        .select("*", { count: 'exact', head: true })
        .eq("concorrente_id", id);

    if (countError) throw countError;

    if (count > 0) {
        throw new Error(`Não é possível excluir: existem ${count} prospects vinculados a este concorrente.`);
    }

    const { error } = await supabase
        .from("concorrentes")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function togglePlotar(id, statusAtual, userId) {
    const { error } = await supabase
        .from("concorrentes")
        .update({ plotar: !statusAtual })
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function marcarTodosParaPlotar(marcar, userId) {
    const { error } = await supabase
        .from("concorrentes")
        .update({ plotar: marcar })
        .eq("user_id", userId);

    if (error) throw error;
}
