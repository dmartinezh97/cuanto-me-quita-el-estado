import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportTicketToPDF = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fdfcf9'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;
  const offsetX = (pageWidth - imgWidth) / 2;
  const offsetY = Math.max((pageHeight - imgHeight) / 2, 10);

  pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight, undefined, 'FAST');
  pdf.save(filename);
};
