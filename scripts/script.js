document.addEventListener("DOMContentLoaded", function() {
    const { jsPDF } = window.jspdf;

    document.getElementById('download-pdf').addEventListener('click', function () {
        const table = document.getElementById('workout-table');

        // Helper function to capture the full table content
        function captureTable() {
            return new Promise((resolve) => {
                const viewportMeta = document.querySelector('meta[name=viewport]');
                const previousContent = viewportMeta.getAttribute('content');
                viewportMeta.setAttribute('content', 'width=1920, initial-scale=1, maximum-scale=1');

                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.top = '-9999px';
                document.body.appendChild(tempContainer);

                const clonedTable = table.cloneNode(true);
                clonedTable.style.width = '100%';
                tempContainer.appendChild(clonedTable);

                html2canvas(clonedTable, { scale: 2, useCORS: true }).then(canvas => {
                    document.body.removeChild(tempContainer);
                    viewportMeta.setAttribute('content', previousContent);

                    resolve(canvas.toDataURL('image/png'));
                });
            });
        }

        // Helper function to add an image to PDF with handling for overflow
        function addContentToPDF(imgData) {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const img = new Image();
            img.src = imgData;
            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;

                // Calculate scale to fit the image within the PDF width
                const scale = pageWidth / imgWidth;
                const scaledImgHeight = imgHeight * scale;

                let y = 0;
                let remainingHeight = scaledImgHeight;

                // Add content to PDF, handling page breaks
                while (remainingHeight > 0) {
                    // Calculate the height to fit on the current page
                    const heightOnPage = Math.min(remainingHeight, pageHeight);

                    // Add the image section to the current page
                    pdf.addImage(imgData, 'PNG', 0, y, pageWidth, heightOnPage);

                    // Update remaining height and adjust y position for the next section
                    remainingHeight -= heightOnPage;
                    y -= heightOnPage;

                    // Add a new page if there is more content
                    // if (remainingHeight > 0) {
                    //     pdf.addPage();
                    // }
                }

                // Save the PDF
                pdf.save('workout-plan.pdf');
            };
        }

        // Capture the full table content and create the PDF
        captureTable().then(imgData => {
            addContentToPDF(imgData);
        });
    });
});
