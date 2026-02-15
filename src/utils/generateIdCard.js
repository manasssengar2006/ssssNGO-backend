const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

module.exports = async (user) => {
  const dir = path.join("uploads", "id-cards");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}.pdf`);
  const doc = new PDFDocument({ size: [350, 220], margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // 🎨 Gradient Background
  const gradient = doc.linearGradient(0, 0, 350, 220);
  gradient.stop(0, "#0C2C55").stop(1, "#296374");
  doc.rect(0, 0, 350, 220).fill(gradient);

  // White panel
  doc.roundedRect(10, 10, 330, 200, 10).fill("#ffffff");

  // 🏢 Logo
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 20, 20, { width: 50 });
  }

  // NGO Name
  doc
    .fillColor("#0C2C55")
    .fontSize(12)
    .text("Svabhiman Siksha Sanskriti Samaajotthaan", 80, 25);

  doc
    .fillColor("#629FAD")
    .fontSize(10)
    .text("Official Member ID", 80, 45);

  // Divider
  doc.moveTo(20, 65).lineTo(330, 65).stroke("#629FAD");

  // Member Info
  doc
    .fillColor("black")
    .fontSize(11)
    .text(`Name: ${user.name}`, 20, 80)
    .text(`Member ID: ${user.memberId}`, 20, 100)
    .text(`Email: ${user.email}`, 20, 120);

  // 🔳 QR Code
  const qr = await QRCode.toDataURL(
    `NGO MEMBER\nID:${user.memberId}\n${user.name}`
  );
  doc.image(qr, 240, 80, { width: 80 });

  // Footer
  doc
    .fontSize(9)
    .fillColor("#888")
    .text("Authorized by Svabhiman NGO", 20, 180);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
};
