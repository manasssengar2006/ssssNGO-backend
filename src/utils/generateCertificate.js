const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = async (user) => {
  const dir = path.join("uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}-certificate.pdf`);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Border
  doc.rect(10, 10, 575, 820).stroke("#296374");

  // Logo
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 250, 30, { width: 90 });
  }

  doc
    .moveDown(6)
    .fontSize(22)
    .fillColor("#0C2C55")
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", {
      align: "center",
    });

  doc
    .moveDown(0.5)
    .fontSize(16)
    .fillColor("#296374")
    .text("CERTIFICATE OF MEMBERSHIP", {
      align: "center",
    });

  doc
    .moveDown(2)
    .fontSize(12)
    .text("This is to certify that", { align: "center" });

  doc
    .moveDown(0.5)
    .fontSize(18)
    .fillColor("#0C2C55")
    .text(user.name, { align: "center" });

  doc
    .moveDown(0.5)
    .fontSize(12)
    .fillColor("black")
    .text("has been officially registered as a member of", {
      align: "center",
    });

  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("#296374")
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", {
      align: "center",
    });

  doc
    .moveDown(1)
    .fontSize(12)
    .text(`Member ID: ${user.memberId}`, { align: "center" });

  doc
    .moveDown(4)
    .fontSize(12)
    .text("______________________", 80, 600)
    .text("Authorized Signatory", 100, 620);

  doc
    .text("______________________", 380, 600)
    .text("President", 420, 620);

  doc.end();

  await new Promise((resolve) => {
    stream.on("finish", resolve);
  });

  return filePath.replace(/\\/g, "/");
};
