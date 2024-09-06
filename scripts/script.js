document.addEventListener("DOMContentLoaded", function() {
    const { jsPDF } = window.jspdf;
    document.getElementById('download-pdf').addEventListener('click', function () {
        const table = document.getElementById('workout-table');
        const cutOffPoint = document.getElementById('cutOffPoint');

        // Helper function to capture a table section
        function captureTableSection(rows) {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.top = '-9999px';
            document.body.appendChild(tempContainer);

            const clonedTable = document.createElement('table');
            clonedTable.style.width = '100%';
            clonedTable.appendChild(table.querySelector('thead').cloneNode(true));
            const tbody = document.createElement('tbody');
            rows.forEach(row => tbody.appendChild(row.cloneNode(true)));
            clonedTable.appendChild(tbody);
            tempContainer.appendChild(clonedTable);

            return html2canvas(clonedTable).then(canvas => {
                document.body.removeChild(tempContainer);
                return canvas.toDataURL('image/png');
            });
        }

        // Split the rows into two sections based on the cutoff point
        const firstPart = [];
        const secondPart = [];
        let isAfterCutoff = false;

        Array.from(table.querySelectorAll('tbody > tr')).forEach(row => {
            if (row === cutOffPoint) {
                isAfterCutoff = true;
            } else if (isAfterCutoff) {
                secondPart.push(row);
            } else {
                firstPart.push(row);
            }
        });

        // Create a PDF
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Capture the first part
        captureTableSection(firstPart).then(imgData1 => {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Fit the image to the full page height
            const imgWidth = pageWidth;
            const imgHeight = pageHeight;

            pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.addPage();

            // Capture the second part
            captureTableSection(secondPart).then(imgData2 => {
                const img = new Image();
                img.src = imgData2;
                img.onload = () => {
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    // Calculate scale to fit the image width to page width
                    const scale = pageWidth / imgWidth;
                    const scaledImgWidth = pageWidth;
                    const scaledImgHeight = imgHeight * scale;

                    // Position the image at the top of the page
                    const x = 0; // No horizontal centering needed as width fits the page
                    const y = 0; // Set y to 0 to place image at the top of the page

                    pdf.addImage(imgData2, 'PNG', x, y, scaledImgWidth, scaledImgHeight);
                    pdf.save('workout-plan.pdf');
                };
            });
        });
    });
});
