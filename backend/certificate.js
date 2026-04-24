const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateCertificate(data) {
  const {
    fileName,
    fingerprint,
    truthScore,
    status
  } = data;

  const filePath = `uploads/certificate-${Date.now()}.pdf`;

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(22).text("TruthTrace Ownership Certificate", {
    align: "center"
  });

  doc.moveDown();

  doc.fontSize(14).text(`File Name: ${fileName}`);
  doc.text(`Verification Status: ${status}`);
  doc.text(`TruthScore: ${truthScore}/100`);
  doc.text(`Generated On: ${new Date().toLocaleString()}`);

  doc.moveDown();

  doc.text("Digital Fingerprint:");
  doc.fontSize(10).text(fingerprint);

  doc.moveDown();

  doc.fontSize(12).text(
    "This certificate verifies the originality and ownership integrity of the uploaded digital media asset.",
    {
      align: "justify"
    }
  );

  doc.end();

  return filePath;
}

module.exports = { generateCertificate };