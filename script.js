document.getElementById('uploadFile').addEventListener('change', handleFileUpload);
document.getElementById('convertButton').addEventListener('click', convertFile);

let uploadedFile = null;

function handleFileUpload(event) {
    uploadedFile = event.target.files[0];
    alert(event.target.files[0]);
}

function processFile(file) {
    if (file.name.endsWith('.docx')) {
        loadDocx(file);
    } else if (file.name.endsWith('.pdf')) {
        loadPdf(file)
    } else {
        alert('Unsupported file type');
    }
}

function convertFile() {
    if (uploadedFile) {
        processFile(uploadedFile);
    } else {
        alert('No file selected');
    }
}

function loadDocx(file) {
    var reader = new FileReader(file);
    reader.onload = function(event) {
        var arrayBuffer = reader.result;
        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
            .then(function(result) {
                document.getElementById('editor').innerHTML = result.value;
            })
            .catch(function(err) {
                console.log(err);
            });
    };
    reader.readAsArrayBuffer(file);
}

function loadPdf(file) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var typedarray = new Uint8Array(this.result);
        var loadingTask = pdfjsLib.getDocument({data: typedarray});
        loadingTask.promise.then(function(pdf) {
            console.log('PDF loaded');
            var totalPages = pdf.numPages;
            var content = ''"";

            function renderPage(pageNum) {
                pdf.getPage(pageNum).then(function(page) {
                    var scale = 1.5;
                    var viewport = page.getViewport({scale: scale});
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    var renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    page.render(renderContext).promise.then(function () {
                        content += '<img src="' + canvas.toDataURL() + '"/>';
                        if (pageNum < totalPages) {
                            renderPage(pageNum + 1);
                        } else {
                            document.getElementById('editor').innerHTML = content;
                        }
                    });
                });
            }
            renderPage(1);
        }, function(reason) {
            console.error(reason);
        });
    };
    fileReader.readAsArrayBuffer(file);
}

function saveAsDocx() {
    var editorContent = document.getElementById('editor').innerHTML;
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + editorContent + '</body></html>';
    var converted = htmlDocx.asBlob(html);
    saveAs(converted, 'document.docx');
}

function saveAsHtml() {
    var htmlContent = document.getElementById('editor').innerHTML;
    var blob = new Blob([htmlContent], {type: "text/html;charset=utf-8"});
    saveAs(blob, "document.html");
}

function saveAsMarkdown() {
    var turndownService = new TurndownService();
    var markdown = turndownService.turndown(document.getElementById('editor').innerHTML);
    var blob = new Blob([markdown], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "document.md");
}

function saveAsPdf() {
    var editorContent = document.getElementById('editor').innerHTML;
    var pdfWindow = window.open('', '_blank');
    pdfWindow.document.write('<html><head><title>PDF</title></head><body>' + editorContent + '</body></html>');
    pdfWindow.document.close();
    pdfWindow.print();
}
