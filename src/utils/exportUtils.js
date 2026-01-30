/**
 * Formata data para nome de arquivo no padrão DDMMMAAAA
 * @param {Date} date - Data para formatar
 * @returns {string} - Data formatada (ex: "24JAN2026")
 */
export function formatarNomeArquivo(date = new Date()) {
  const dia = String(date.getDate()).padStart(2, '0');
  
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const mes = meses[date.getMonth()];
  
  const ano = date.getFullYear();
  
  return `${dia}${mes}${ano}`;
}

/**
 * Filtra campos do objeto visita para exportação
 * Remove: id, user_id, created_at, updated_at
 * @param {Object} visita - Visita do banco
 * @returns {Object} - Visita filtrada
 */
export function filtrarCamposExportacao(visita) {
  const { id, user_id, created_at, updated_at, ...filtered } = visita;
  return filtered;
}

/**
 * Gera nome completo do arquivo de exportação
 * @param {Date} date - Data para usar no nome
 * @returns {string} - Nome completo (ex: "Visitas_export_24JAN2026.json")
 */
export function gerarNomeArquivoExportacao(date = new Date()) {
  const dataFormatada = formatarNomeArquivo(date);
  return `Visitas_export_${dataFormatada}.json`;
}
