const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = async (user) => {
  const dir = path.join("uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}-certificate.pdf`);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // 🎨 HEADER GRADIENT
  const header = doc.linearGradient(0, 0, 595, 0);
  header.stop(0, "#0C2C55").stop(1, "#629FAD");
  doc.rect(0, 0, 595, 130).fill(header);

  // BORDER
  doc
    .lineWidth(2)
    .strokeColor("#296374")
    .rect(15, 15, 565, 812)
    .stroke();

  // LOGO
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 250, 25, { width: 90 });
  }

  // NGO NAME
  doc
    .fillColor("#0C2C55")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", 0, 160, {
      align: "center",
    });

  // SUBTITLE
  doc
    .fillColor("#296374")
    .fontSize(18)
    .text("CERTIFICATE OF MEMBERSHIP", {
      align: "center",
    });

  // BODY TEXT
  doc
    .moveDown(2)
    .fillColor("black")
    .fontSize(14)
    .text("This is to certify that", {
      align: "center",
    });

  // MEMBER NAME
  doc
    .moveDown(0.5)
    .fillColor("#0C2C55")
    .fontSize(26)
    .font("Helvetica-Bold")
    .text(user.name, {
      align: "center",
    });

  // DESCRIPTION
  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("black")
    .font("Helvetica")
    .text("has been officially registered as a member of", {
      align: "center",
    });

  doc
    .moveDown(0.3)
    .fontSize(16)
    .fillColor("#296374")
    .font("Helvetica-Bold")
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", {
      align: "center",
    });

  // MEMBER ID
  doc
    .moveDown(1)
    .fontSize(14)
    .fillColor("black")
    .font("Helvetica")
    .text(`Member ID: ${user.memberId}`, {
      align: "center",
    });

  // SIGNATURES
  const y = 650;

  doc.moveTo(80, y).lineTo(220, y).stroke();
  doc.fontSize(12).text("Authorized Signatory", 80, y + 5);

  doc.moveTo(380, y).lineTo(520, y).stroke();
  doc.text("President", 380, y + 5);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
};
