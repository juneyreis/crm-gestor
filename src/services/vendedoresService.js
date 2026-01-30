import { supabaseClient as supabase } from "../lib/supabaseClient";

export async function listarVendedores(userId) {
    // O RLS já filtra por usuário no lado do banco, mas podemos reforçar
    const { data, error } = await supabase
        .from("vendedores")
        .select("*")
        .eq("user_id", userId)
        .order("nome", { ascending: true });

    if (error) throw error;
    return data;
}

export async function criarVendedor(dados, userId) {
    // Validação
    if (!dados.nome || dados.nome.trim() === "") {
        throw new Error("O nome é obrigatório.");
    }

    // Prepara payload com user_id
    const payload = {
        user_id: userId,
        nome: dados.nome.toUpperCase(),
        endereco: dados.endereco ? dados.endereco.toUpperCase() : null,
        cidade: dados.cidade ? dados.cidade.toUpperCase() : null,
        cep: dados.cep,
        uf: dados.uf ? dados.uf.toUpperCase() : null,
        celular: dados.celular
    };

    const { error } = await supabase
        .from("vendedores")
        .insert([payload]);

    if (error) throw error;
}

export async function atualizarVendedor(id, dados, userId) {
    const payload = {};

    if (dados.nome !== undefined) {
        if (!dados.nome || dados.nome.trim() === "") {
            throw new Error("O nome é obrigatório.");
        }
        payload.nome = dados.nome.toUpperCase();
    }

    if (dados.endereco !== undefined) payload.endereco = dados.endereco ? dados.endereco.toUpperCase() : null;
    if (dados.cidade !== undefined) payload.cidade = dados.cidade ? dados.cidade.toUpperCase() : null;
    if (dados.cep !== undefined) payload.cep = dados.cep;
    if (dados.uf !== undefined) payload.uf = dados.uf ? dados.uf.toUpperCase() : null;
    if (dados.celular !== undefined) payload.celular = dados.celular;

    const { error } = await supabase
        .from("vendedores")
        .update(payload)
        .eq("id", id)
        // .eq("user_id", userId) // RLS garante isso, mas redundância é ok
        ;

    if (error) throw error;
}

export async function excluirVendedor(id, userId) {
    // Verificar dependências em CLIENTES
    const { count: countClientes, error: errorClientes } = await supabase
        .from("clientes")
        .select("*", { count: 'exact', head: true })
        .eq("vendedor_id", id);

    if (errorClientes) throw errorClientes;

    if (countClientes > 0) {
        throw new Error(`Não é possível excluir: existem ${countClientes} clientes vinculados a este vendedor.`);
    }

    // Verificar dependências em COMISSOES
    const { count: countComissoes, error: errorComissoes } = await supabase
        .from("comissoes")
        .select("*", { count: 'exact', head: true })
        .eq("vendedor_id", id);

    if (errorComissoes) throw errorComissoes;

    if (countComissoes > 0) {
        throw new Error(`Não é possível excluir: existem ${countComissoes} comissões vinculadas a este vendedor.`);
    }

    const { error } = await supabase
        .from("vendedores")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
