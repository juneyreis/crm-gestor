import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from a DOM element
 * @param {string} elementId - ID of the element to capture
 * @param {string} fileName - Name of the file to save
 */
export const generatePDF = async (elementId, fileName = 'relatorio.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
};

/**
 * Generates an HTML report or prepares it for printing
 * @param {string} elementId - ID of the element to print
 */
export const printReport = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Relatório</title>');

  // Clone styles from main document
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach(style => {
    printWindow.document.write(style.outerHTML);
  });

  printWindow.document.write('</head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');

  printWindow.document.close();
  printWindow.focus();

  // Wait for resources to load
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

/**
 * Gera um nome de arquivo padrão para exportação baseado na data atual
 * @returns {string} Nome do arquivo formatado
 */
export const gerarNomeArquivoExportacao = () => {
  const data = new Date().toISOString().split('T')[0];
  return `visitas-export-${data}.json`;
};

/**
 * Filtra os campos desnecessários de um objeto de visita para exportação limpa
 * @param {Object} visita - Objeto original da visita
 * @returns {Object} Objeto filtrado
 */
export const filtrarCamposExportacao = (visita) => {
  // Pick specific fields for export
  const {
    id,
    prospect,
    data,
    cidade,
    bairro,
    sistema,
    contato,
    status,
    obs,
    prospects,
    concorrentes
  } = visita;

  return {
    id,
    prospect,
    data,
    cidade,
    bairro,
    sistema,
    contato,
    status,
    obs,
    dados_relacionais: {
      prospect: prospects || null,
      concorrente: concorrentes || null
    }
  };
};
