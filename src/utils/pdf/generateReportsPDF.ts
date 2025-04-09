import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../../types';

export const generateReportsPDF = async (
  reportsContainerRef: HTMLDivElement,
  orders: Order[]
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.height;
    let position = 0;

    // Capture each report section
    const elements = reportsContainerRef.children;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add new page if needed
      if (position + imgHeight > pageHeight) {
        pdf.addPage();
        position = 0;
      }

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      position += imgHeight + 10; // Add some spacing between sections
    }

    // Save the PDF
    const date = new Date().toISOString().split('T')[0];
    pdf.save(`reports-${date}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};