const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

module.exports = async (user) => {
  const dir = path.join("uploads", "id-cards");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}.pdf`);

  const doc = new PDFDocument({
    size: [350, 220],
    margin: 10,
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Border
  doc.rect(5, 5, 340, 210).stroke("#296374");

  // Logo
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 15, 15, { width: 50 });
  }

  // NGO Name
  doc
    .fontSize(12)
    .fillColor("#0C2C55")
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", 80, 20);

  doc
    .fontSize(10)
    .fillColor("#296374")
    .text("NGO Member Identity Card", 80, 40);

  // Member info
  doc
    .fontSize(11)
    .fillColor("black")
    .text(`Name: ${user.name}`, 20, 80)
    .text(`Member ID: ${user.memberId}`, 20, 100)
    .text(`Email: ${user.email}`, 20, 120);

  // QR Code
  const qrData = `NGO MEMBER\nID: ${user.memberId}\nName: ${user.name}`;
  const qrImage = await QRCode.toDataURL(qrData);

  doc.image(qrImage, 240, 80, { width: 80 });

  doc.fontSize(9).text("Authorized by Svabhiman NGO", 20, 180);

  doc.end();

  // WAIT FOR FILE TO FINISH WRITING
  await new Promise((resolve) => {
    stream.on("finish", resolve);
  });

  return filePath.replace(/\\/g, "/");
};
