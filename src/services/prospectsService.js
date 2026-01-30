// src/services/prospectsService.js
import { supabaseClient as supabase } from "../lib/supabaseClient";

/**
 * Lista prospects do usuário atual, com filtros opcionais
 * @param {string} userId - ID do usuário autenticado
 * @param {Object} filters - Filtros a serem aplicados
 * @returns {Promise<Array>} Lista de prospects
 */
export const listar = async (userId, filters = {}) => {
    try {
        let query = supabase
            .from('prospects')
            .select(`
        *,
        segmentos:segmento_id (descricao),
        concorrentes:concorrente_id (descricao)
      `)
            .eq('user_id', userId)
            .order('data_cadastro', { ascending: false });

        // Aplicação de filtros (se houver lógica server-side, mas por enquanto faremos client-side ou misto)
        // Se a tabela crescer muito, mover filtros para cá é ideal.

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao listar prospects:', error);
        throw error;
    }
};

/**
 * Cria um novo prospect
 * @param {Object} prospect - Dados do prospect
 * @returns {Promise<Object>} Prospect criado
 */
export const criar = async (prospect) => {
    try {
        // Remove campos expandidos/auxiliares antes de salvar
        const { segmentos, concorrentes, ...dadosParaSalvar } = prospect;

        const { data, error } = await supabase
            .from('prospects')
            .insert([dadosParaSalvar])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao criar prospect:', error);
        throw error;
    }
};

/**
 * Atualiza um prospect existente
 * @param {number} id - ID do prospect
 * @param {Object} prospect - Dados atualizados
 * @returns {Promise<Object>} Prospect atualizado
 */
export const atualizar = async (id, prospect) => {
    try {
        // Remove campos expandidos/auxiliares antes de salvar
        const { segmentos, concorrentes, ...dadosParaSalvar } = prospect;

        const { data, error } = await supabase
            .from('prospects')
            .update(dadosParaSalvar)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar prospect:', error);
        throw error;
    }
};

/**
 * Remove um prospect
 * @param {number} id - ID do prospect
 * @returns {Promise<void>}
 */
export const remover = async (id) => {
    try {
        const { error } = await supabase
            .from('prospects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao remover prospect:', error);
        throw error;
    }
};
