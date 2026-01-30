// src/hooks/useCEP.js
import { useState, useCallback } from 'react';
import * as cepService from '../services/cepService';

/**
 * Hook para gerenciar consulta de CEP
 * @returns {Object} Estados e funções do CEP
 */
export const useCEP = () => {
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cepStatus, setCepStatus] = useState('idle'); // idle, loading, success, error

    // Formata CEP: XXXXX-XXX
    const formatCEP = (cep) => {
        if (!cep) return '';
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length <= 5) return cleaned;
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    };

    const fetchCEP = useCallback(async (cep) => {
        const cleanedCEP = cep.replace(/\D/g, '');

        // Só consulta se tiver 8 dígitos
        if (cleanedCEP.length !== 8) {
            // Não define erro aqui para permitir digitação, apenas não consulta
            // Mas se o usuário colar algo errado, pode ser útil validar no onBlur
            return null;
        }

        setLoading(true);
        setCepStatus('loading');
        setError(null);

        // Timeout de 10 segundos
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite excedido')), 10000)
        );

        try {
            // Race entre a consulta e o timeout
            const result = await Promise.race([
                cepService.consultar(cleanedCEP),
                timeoutPromise
            ]);

            if (result.success) {
                setAddress(result.data);
                setCepStatus('success');
                return result.data;
            } else {
                setError(result.error || 'Erro ao consultar CEP');
                setCepStatus('error');
                return null;
            }
        } catch (err) {
            setError(err.message || 'Erro na conexão com o servidor');
            setCepStatus('error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAddress = () => {
        setAddress(null);
        setError(null);
        setCepStatus('idle');
    };

    return {
        address,
        loading,
        error,
        cepStatus,
        fetchCEP,
        formatCEP,
        clearAddress
    };
};

export default useCEP;
