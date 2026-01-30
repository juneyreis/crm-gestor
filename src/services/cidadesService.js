// src/services/cidadesService.js
import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Lista todas as cidades do Rio Grande do Sul da tabela cidades_rs
 * @returns {Promise<Array>} Lista de cidades
 */
export const listarCidades = async () => {
    try {
        const { data, error } = await supabase
            .from('cidades_rs')
            .select('id, nome')
            .order('nome', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao listar cidades:', error);
        throw error;
    }
};
