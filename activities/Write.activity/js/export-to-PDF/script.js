function downloadPDF(){
    richTextField.document.body.scrollTop = richTextField.document.documentElement.scrollTop = 0;
    html2canvas(richTextField.document.getElementsByTagName('body')[0],{
        onrendered : function(canvas){
            var imgData = canvas.toDataURL('image/png');

            var imgWidth = 210;
            var pageHeight = 295;
            var imgHeight = canvas.height * imgWidth / canvas.width;
            var heightLeft = imgHeight;

            var doc = new jsPDF('p', 'mm');
            var position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            }
            doc.save( 'download.pdf');

        }
    })
}