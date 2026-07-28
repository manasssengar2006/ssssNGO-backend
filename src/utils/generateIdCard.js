const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

// ================= CONFIG =================
const ORG_NAME = "Swabhiman Shiksha Sanskriti Samajotthan Nyas";

// Folders to search for the uploaded member photo (by filename only).
// Edit this list to match wherever your multer/uploadDocs middleware
// actually saves files (photoFile only stores the filename, not the path).
const PHOTO_SEARCH_DIRS = [
  path.join("uploads", "docs"), // matches uploadDocs.js multer destination
  path.join("uploads"),
];

function resolveUploadedFile(filename) {
  if (!filename) return null;
  for (const dir of PHOTO_SEARCH_DIRS) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// ================= ID CARD =================
// Expects: { name, email, phone, memberId, membershipType, validTill, photoFile }
module.exports = async (user) => {
  const dir = path.join("uploads", "id-cards");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${user.memberId}.pdf`);

  // Landscape card, scaled up (~3.5x standard CR80) for a crisp, print-ready PDF
  const W = 1050;
  const H = 660;

  const doc = new PDFDocument({ size: [W, H], margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ---------- Background ----------
  doc.rect(0, 0, W, H).fill("#f4f6f8");

  // ---------- Header band ----------
  const headerH = 150;
  const headerGradient = doc.linearGradient(0, 0, W, 0);
  headerGradient.stop(0, "#0C2C55").stop(1, "#296374");
  doc.rect(0, 0, W, headerH).fill(headerGradient);

  // gold accent stripe under header
  doc.rect(0, headerH, W, 8).fill("#E1B12C");

  // Logo
  const logoPath = path.join("uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 30, 25, { width: 100, height: 100 });
  }

  // Org name + tagline
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(ORG_NAME, 150, 28, { width: W - 400 });

  doc
    .font("Helvetica")
    .fontSize(15)
    .fillColor("#cfe3ea")
    .text("Official Membership Identity Card", 150, 74, { width: W - 400 });

  const membershipLabel =
    user.membershipType === "permanent" ? "PERMANENT MEMBER" : "ANNUAL MEMBER";
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#E1B12C")
    .text(membershipLabel, 150, 104);

  // ---------- Photo panel ----------
  const photoSize = 220;
  const photoX = 45;
  const photoY = headerH + 45;

  doc
    .roundedRect(photoX - 8, photoY - 8, photoSize + 16, photoSize + 16, 12)
    .lineWidth(3)
    .strokeColor("#0C2C55")
    .stroke();

  const photoPath = resolveUploadedFile(user.photoFile);
  if (photoPath) {
    doc.save();
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 8).clip();
    doc.image(photoPath, photoX, photoY, {
      width: photoSize,
      height: photoSize,
      cover: [photoSize, photoSize],
      align: "center",
      valign: "center",
    });
    doc.restore();
  } else {
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 8).fill("#e2e8ee");
    doc
      .fillColor("#96a5b3")
      .fontSize(14)
      .font("Helvetica")
      .text("No Photo", photoX, photoY + photoSize / 2 - 7, {
        width: photoSize,
        align: "center",
      });
  }

  // ---------- Info block ----------
  const infoX = photoX + photoSize + 60;
  let infoY = headerH + 55;
  const lineGap = 46;

  function infoLine(label, value) {
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#296374")
      .text(label.toUpperCase(), infoX, infoY);
    doc
      .font("Helvetica-Bold")
      .fontSize(19)
      .fillColor("#0C2C55")
      .text(value || "-", infoX, infoY + 16, { width: 480 });
    infoY += lineGap;
  }

  infoLine("Name", user.name);
  infoLine("Member ID", user.memberId);
  infoLine("Email", user.email);
  infoLine("Phone", user.phone);
  infoLine(
    "Valid Till",
    user.validTill
      ? new Date(user.validTill).toLocaleDateString("en-IN")
      : "Lifetime"
  );

  // ---------- QR code ----------
  const qrData = `${ORG_NAME}\nMember ID: ${user.memberId}\nName: ${user.name}`;
  const qr = await QRCode.toDataURL(qrData, { margin: 0 });
  const qrSize = 150;
  const qrX = W - qrSize - 50;
  const qrY = headerH + 45;

  doc.image(qr, qrX, qrY, { width: qrSize, height: qrSize });
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#555")
    .text("Scan to verify", qrX, qrY + qrSize + 8, {
      width: qrSize,
      align: "center",
    });

  // ---------- Footer ----------
  const footerY = H - 70;
  doc.rect(0, footerY, W, 70).fill("#0C2C55");
  doc
    .fillColor("#ffffff")
    .fontSize(12)
    .font("Helvetica")
    .text(
      `This card is the property of ${ORG_NAME} and must be returned upon request.`,
      40,
      footerY + 25,
      { width: W - 80, align: "center" }
    );

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
};