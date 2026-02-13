/**
 * Templates para exportação de relatórios em HTML com CSS inline
 * Baseado no modelo premium "Visitas 15JAN2026.html"
 */

export const generateVisitsHTML = (visitas, filters = {}) => {
    const dataExport = new Date().toLocaleString('pt-BR');
    const totalVisitas = visitas.length;

    // Estatísticas
    const realizadas = visitas.filter(v => v.status === 'Realizada').length;
    const agendadas = visitas.filter(v => v.status === 'Agendada').length;
    const canceladas = visitas.filter(v => v.status === 'Cancelada').length;
    const atrasadas = visitas.filter(v => v.status === 'Atrasada').length;

    const percAgendadas = totalVisitas > 0 ? ((agendadas / totalVisitas) * 100).toFixed(1) : 0;

    // Gerar linhas da tabela
    const rows = visitas.map(v => {
        const dataFormatada = v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '-';
        const prospectNome = v.prospects?.nome || v.prospect || 'N/A';
        const endereco = v.prospects?.endereco || 'Endereço não informado';
        const bairro = v.prospects?.bairro || v.bairro || '-';
        const contato = v.contato || v.prospects?.contato || '';
        const sistema = v.sistema || 'INDEFINIDO';
        const tipo = v.tipo || 'Sondagem';
        const prioridade = v.prioridade || 'Baixa';
        const observacao = v.observacoes || '';

        const priorityClass = `priority-${prioridade.toLowerCase()}`;
        const statusClass = `status-${v.status?.toLowerCase() || 'agendada'}`;
        const priorityEmoji = prioridade === 'Alta' ? '🔴' : prioridade === 'Média' ? '🟡' : '🟢';
        const statusEmoji = v.status === 'Realizada' ? '✅' : v.status === 'Cancelada' ? '❌' : v.status === 'Atrasada' ? '⚠️' : '⏳';

        return `
      <tr>
          <td class="data-column"><strong>${dataFormatada}</strong></td>
          <td>
              <div class="prospect-nome">${prospectNome}</div>
              <div class="endereco-cell">${endereco}</div>
          </td>
          <td class="contato-sistema-column">
              <div class="contato-cell">${contato}</div>
              <div class="sistema-cell">${sistema}</div>
          </td>
          <td class="bairro-column">${bairro}</td>
          <td class="tipo-column">
              <span class="tipo-visita">${tipo}</span>
          </td>
          <td class="prioridade-status-column">
              <div>
                  <span class="priority-badge ${priorityClass}" title="${prioridade}">
                      ${priorityEmoji} ${prioridade}
                  </span>
              </div>
              <div>
                  <span class="status-badge ${statusClass}" title="${v.status}">
                      ${statusEmoji} ${v.status}
                  </span>
              </div>
          </td>
          <td class="observacoes-cell">
              ${observacao || '<em style="color: #999;">Nenhuma observação</em>'}
          </td>
      </tr>
    `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Visitas - CRM GESTOR</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 0; padding: 10px; background-color: #f8f9fa; }
        .header { background: linear-gradient(135deg, #106EBE, #0078D4); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; box-shadow: 0 3px 5px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
        .header .subtitle { margin-top: 5px; opacity: 0.9; font-size: 13px; }
        .section { background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid #0078D4; }
        .section-title { color: #2c3e50; font-size: 16px; font-weight: bold; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; }
        .stats-horizontal { display: flex; flex-direction: row; justify-content: space-between; flex-wrap: nowrap; gap: 8px; margin-bottom: 12px; }
        .stat-card-horizontal { flex: 1; background-color: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center; border-top: 3px solid; min-width: 0; }
        .stat-value-horizontal { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .stat-label-horizontal { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .visita-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .visita-table th { background-color: #106EBE; color: white; padding: 10px; text-align: left; font-weight: bold; font-size: 11px; }
        .visita-table td { padding: 8px; border-bottom: 1px solid #dee2e6; vertical-align: top; }
        .data-column { white-space: nowrap; min-width: 105px; width: 105px; font-weight: bold; }
        .contato-sistema-column { min-width: 140px; width: 140px; }
        .prioridade-status-column { min-width: 110px; width: 110px; }
        .bairro-column { min-width: 100px; width: 100px; font-size: 11px; }
        .tipo-column { min-width: 90px; width: 90px; font-size: 10px; }
        .visita-table tr:nth-child(even) { background-color: #f8f9fa; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; margin-right: 5px; }
        .status-realizada { background-color: #d4edda; color: #155724; }
        .status-agendada { background-color: #cce5ff; color: #004085; }
        .status-cancelada { background-color: #f8d7da; color: #721c24; }
        .status-atrasada { background-color: #fff3cd; color: #856404; }
        .observacoes-cell { font-size: 10px; color: #666; white-space: normal; word-wrap: break-word; max-width: 300px; min-width: 250px; line-height: 1.4; }
        .contato-cell { font-size: 12px; font-weight: bold; color: #2c3e50; margin-bottom: 2px; }
        .sistema-cell { font-size: 12px; color: #2c3e50; }
        .tipo-visita { background-color: #e8f4fc; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #2c3e50; white-space: nowrap; }
        .priority-badge { display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 9px; font-weight: bold; margin-bottom: 2px; }
        .priority-alta { background-color: #f8d7da; color: #721c24; }
        .priority-media { background-color: #fff3cd; color: #856404; }
        .priority-baixa { background-color: #d4edda; color: #155724; }
        .footer { margin-top: 15px; padding: 12px; background-color: #106EBE; color: white; text-align: center; border-radius: 6px; font-size: 11px; }
        .filtros-info { background-color: #e8f4fc; padding: 10px; border-radius: 5px; margin-bottom: 15px; border-left: 4px solid #0078D4; }
        .endereco-cell { font-size: 9px; color: #666; margin-top: 2px; }
        .prospect-nome { font-weight: bold; font-size: 12px; }
        .legenda-compacta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; font-size: 11px; justify-content: center; }
        .legenda-item { display: flex; align-items: center; margin-right: 15px; }
        .color-box { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 RELATÓRIO DE VISITAS</h1>
        <div class="subtitle">CRM GESTOR | ${dataExport}</div>
    </div>
    
    <div class="filtros-info">
        <h3 style="margin-top: 0; margin-bottom: 8px;">📋 Informações do Relatório</h3>
        <div><b>📅 Data da Exportação:</b> ${dataExport}</div>
        <div><b>📊 Total de Visitas:</b> ${totalVisitas}</div>
        ${filters.dateFrom || filters.dateTo ? `<div><b>🔍 Filtros Aplicados:</b> Período ${filters.dateFrom || ''} a ${filters.dateTo || ''}</div>` : ''}
    </div>

    <div class="section">
        <h2 class="section-title">📊 ESTATÍSTICAS DAS VISITAS</h2>
        <div class="stats-horizontal">
            <div class="stat-card-horizontal" style="border-color: #0078D4">
                <div class="stat-value-horizontal" style="color: #0078D4">📊 ${totalVisitas}</div>
                <div class="stat-label-horizontal">Total</div>
            </div>
            <div class="stat-card-horizontal" style="border-color: #28a745">
                <div class="stat-value-horizontal" style="color: #28a745">✅ ${realizadas}</div>
                <div class="stat-label-horizontal">Realizadas</div>
            </div>
            <div class="stat-card-horizontal" style="border-color: #007bff">
                <div class="stat-value-horizontal" style="color: #007bff">⏳ ${agendadas}</div>
                <div class="stat-label-horizontal">Agendadas</div>
            </div>
            <div class="stat-card-horizontal" style="border-color: #dc3545">
                <div class="stat-value-horizontal" style="color: #dc3545">❌ ${canceladas}</div>
                <div class="stat-label-horizontal">Canceladas</div>
            </div>
            <div class="stat-card-horizontal" style="border-color: #ffc107">
                <div class="stat-value-horizontal" style="color: #ffc107">⚠️ ${atrasadas}</div>
                <div class="stat-label-horizontal">Atrasadas</div>
            </div>
        </div>
        <div class="legenda-compacta">
            <div class="legenda-item">
                <div class="color-box" style="background-color: #007bff"></div>
                <span>Agendadas: <strong>${agendadas}</strong> (${percAgendadas}%)</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">📅 DETALHES DAS VISITAS</h2>
        <table class="visita-table">
            <thead>
                <tr>
                    <th class="data-column">Data</th>
                    <th>Prospect</th>
                    <th class="contato-sistema-column">Contato / Sistema</th>
                    <th class="bairro-column">Bairro</th>
                    <th class="tipo-column">Tipo</th>
                    <th class="prioridade-status-column">Prioridade / Status</th>
                    <th>Observações</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <div>📄 <strong>Relatório de Visitas</strong> - CRM GESTOR</div>
        <div style="font-size: 10px; opacity: 0.8; margin-top: 3px;">Exportado em ${dataExport} | Total: ${totalVisitas} visitas</div>
    </div>
</body>
</html>
  `;
};
