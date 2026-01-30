// src/services/cepService.js
/**
 * Serviço para consulta de CEP usando ViaCEP
 */
export const consultar = async (cep) => {
  try {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    // Validação básica
    if (cleanCep.length !== 8) {
      return { success: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      return { success: false, error: 'CEP não encontrado' };
    }

    // Normaliza os dados para o formato esperado pelo hook/formulário
    // Converte para maiúsculas conforme regras de negócio
    return {
      success: true,
      data: {
        cep: data.cep,
        logradouro: data.logradouro.toUpperCase(),
        complemento: data.complemento.toUpperCase(),
        bairro: data.bairro.toUpperCase(),
        cidade: data.localidade.toUpperCase(),
        uf: data.uf.toUpperCase(),
        ibge: data.ibge,
        ddd: data.ddd
      }
    };
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return { success: false, error: 'Erro ao conectar-se ao serviço de CEP' };
  }
};
