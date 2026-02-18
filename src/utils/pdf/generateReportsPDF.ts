import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures each section container as a single screenshot and assmebles them
 * into a multi-page PDF. Sections that are off-screen are temporarily
 * repositioned so html2canvas can measure them correctly.
 */
export const generateReportsPDF = async (
  sectionContainers: HTMLDivElement[]
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 0; // Full width capture
  const usableWidth = pageWidth - (margin * 2);
  const usableHeight = pageHeight - (margin * 2);

  // Set default PDF background color to dark #0F1115
  pdf.setFillColor(15, 17, 21);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  let isFirstPage = true;

  // Scroll to top just in case
  window.scrollTo(0, 0);

  for (const container of sectionContainers) {
    // 1. Prepare element for capture
    const originalStyles = {
      position: container.style.position,
      left: container.style.left,
      top: container.style.top,
      width: container.style.width,
      zIndex: container.style.zIndex,
      opacity: container.style.opacity,
    };

    // Temporarily bring it into view/layout for capture
    // Use absolute positioning relative to document body (assuming body is positioned static)
    // Force a standard desktop width to ensure layout is consistent
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '1200px';
    container.style.zIndex = '9999'; // Bring to front to ensure visibility
    container.style.opacity = '1';

    // Add a solid background color to the container itself to avoid transparency issues
    const originalBg = container.style.backgroundColor;
    container.style.backgroundColor = '#0F1115';

    // Wait for layout and charts (if any) to render/resize
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // 2. Capture
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0F1115', // Ensure canvas background matches app
        windowWidth: 1200, // Match container width
        x: 0,
        y: 0,
        scrollY: -window.scrollY, // Fix for scrolled page capture issues
      });

      // 3. Add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
        // Re-apply dark background to new page
        pdf.setFillColor(15, 17, 21);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      isFirstPage = false;

      // If image fits on one page
      if (imgHeight <= usableHeight) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      } else {
        // Multi-page split for long sections
        let currentY = 0;
        let remainingHeight = canvas.height;

        // Height of canvas that fits on one PDF page
        const pageCanvasHeight = (canvas.width * usableHeight) / usableWidth;

        while (remainingHeight > 0) {
          const sliceHeight = Math.min(remainingHeight, pageCanvasHeight);

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;

          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            // Fill slice canvas with background color first
            ctx.fillStyle = '#0F1115';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

            ctx.drawImage(
              canvas,
              0, currentY, canvas.width, sliceHeight,
              0, 0, canvas.width, sliceHeight
            );

            const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);

            if (currentY > 0) {
              pdf.addPage();
              // Re-apply dark background to new page
              pdf.setFillColor(15, 17, 21);
              pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            }

            const pdfSliceHeight = (sliceHeight * imgWidth) / canvas.width;
            pdf.addImage(sliceImgData, 'JPEG', margin, margin, imgWidth, pdfSliceHeight);
          }

          currentY += sliceHeight;
          remainingHeight -= sliceHeight;
        }
      }

    } catch (err) {
      console.error('Error rendering section pdf:', err);
    } finally {
      // 4. Restore styles
      container.style.position = originalStyles.position;
      container.style.left = originalStyles.left;
      container.style.top = originalStyles.top;
      container.style.width = originalStyles.width;
      container.style.zIndex = originalStyles.zIndex;
      container.style.opacity = originalStyles.opacity;
      container.style.backgroundColor = originalBg;
    }
  }

  const date = new Date().toISOString().split('T')[0];
  pdf.save(`cactus-reports-${date}.pdf`);
};